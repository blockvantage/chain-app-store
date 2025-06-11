package main

import (
	"github.com/gin-gonic/gin"

	"github.com/blockvantage/chain-app-store/backend/config"
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

	// Public routes
	r.GET("/apps", storage.GetApps(db))
	r.GET("/apps/:id", storage.GetApp(db))
	r.GET("/apps/images/:id", storage.GetAppImage(db, cfg))
	r.POST("/apps", storage.CreateApp(db, cfg))

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(storage.AdminAuthMiddleware(cfg))
	{
		admin.POST("/feature", storage.FeatureApp(db))
		admin.POST("/hide", storage.HideApp(db))
	}

	return r
}
