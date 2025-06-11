package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"github.com/blockvantage/chain-app-store/backend/config"
	"github.com/blockvantage/chain-app-store/backend/plugins/boosting"
	"github.com/blockvantage/chain-app-store/backend/storage"
)

func setupRouter(db *storage.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Get base path from environment variable
	basePath := os.Getenv("API_BASE_PATH")
	
	// Create API group with base path
	api := r.Group(basePath)
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Config endpoint
		api.GET("/config", func(c *gin.Context) {
			c.JSON(http.StatusOK, cfg.GetPublicConfig())
		})

		// Public routes
		api.GET("/apps", storage.GetApps(db))
		api.GET("/apps/:id", storage.GetApp(db))
		api.GET("/apps/images/:id", storage.GetAppImage(db, cfg))
		api.POST("/apps", storage.CreateApp(db, cfg))

		// Register boosting plugin routes
		boosting.RegisterRoutes(api, db, cfg)

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(storage.AdminAuthMiddleware(cfg))
		{
			admin.POST("/feature", storage.FeatureApp(db))
			admin.POST("/hide", storage.HideApp(db))
		}
	}

	return r
}
