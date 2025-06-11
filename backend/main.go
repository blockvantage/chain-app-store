package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/blockvantage/chain-app-store/backend/config"
	"github.com/blockvantage/chain-app-store/backend/plugins/boosting"
	"github.com/blockvantage/chain-app-store/backend/plugins/poe"
	"github.com/blockvantage/chain-app-store/backend/plugins/reviews"
	"github.com/blockvantage/chain-app-store/backend/storage"
)

func main() {
	log.Println("Starting Chain App Hub backend...")

	// Load configuration
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "/config/config.json"
	}

	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./appstore.db"
	}

	// Ensure directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		log.Fatalf("Failed to create database directory: %v", err)
	}

	db, err := storage.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Run migrations
	if err := storage.RunMigrations(db, cfg); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize router
	router := gin.Default()

	// Configure CORS middleware
	router.Use(cors.Default())
	// Enable all origins for development
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Register core routes
	registerCoreRoutes(router, db, cfg)

	// Register plugin routes based on config
	registerPluginRoutes(router, db, cfg)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func registerCoreRoutes(router *gin.Engine, db *storage.DB, cfg *config.Config) {
	// Get the base path from environment variable, default to empty string
	basePath := os.Getenv("API_BASE_PATH")
	
	// Create a router group with the base path
	api := router.Group(basePath)
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Get public config
		api.GET("/config", func(c *gin.Context) {
			c.JSON(http.StatusOK, cfg.GetPublicConfig())
		})

		// App routes
		api.GET("/apps", storage.GetApps(db))
		api.GET("/apps/:id", storage.GetApp(db))
		api.POST("/apps", storage.CreateApp(db, cfg))
		api.Static("/images", cfg.Storage.ImagesPath)

		// Admin routes with authentication middleware
		admin := api.Group("/admin")
		admin.Use(storage.AdminAuthMiddleware(cfg))
		{
			admin.POST("/feature", storage.FeatureApp(db))
			admin.POST("/hide", storage.HideApp(db))
		}
	}
}

func registerPluginRoutes(router *gin.Engine, db *storage.DB, cfg *config.Config) {
	// Register boosting plugin if enabled
	if cfg.EnableModules.Boosting {
		log.Println("Registering boosting plugin...")
		if err := registerBoostingPlugin(router, db, cfg); err != nil {
			log.Printf("Failed to register boosting plugin: %v", err)
		}
	}

	// Register reviews plugin if enabled
	if cfg.EnableModules.Reviews {
		log.Println("Registering reviews plugin...")
		if err := registerReviewsPlugin(router, db, cfg); err != nil {
			log.Printf("Failed to register reviews plugin: %v", err)
		}
	}

	// Register POE plugin if enabled
	if cfg.EnableModules.Poe {
		log.Println("Registering POE plugin...")
		if err := registerPoePlugin(router, db, cfg); err != nil {
			log.Printf("Failed to register POE plugin: %v", err)
		}
	}
}

func registerBoostingPlugin(router *gin.Engine, db *storage.DB, cfg *config.Config) error {
	// Get base path from environment variable
	basePath := os.Getenv("API_BASE_PATH")
	
	// Create API group with base path
	api := router.Group(basePath)
	
	// Import and register boosting plugin
	return boosting.RegisterRoutes(api, db, cfg)
}

func registerReviewsPlugin(router *gin.Engine, db *storage.DB, cfg *config.Config) error {
	// Get base path from environment variable
	basePath := os.Getenv("API_BASE_PATH")
	
	// Create API group with base path
	api := router.Group(basePath)
	
	// Import and register reviews plugin
	return reviews.RegisterRoutes(api, db, cfg)
}

func registerPoePlugin(router *gin.Engine, db *storage.DB, cfg *config.Config) error {
	// Get base path from environment variable
	basePath := os.Getenv("API_BASE_PATH")
	
	// Create API group with base path
	api := router.Group(basePath)
	
	// Import and register POE plugin
	return poe.RegisterRoutes(api, db, cfg)
}
