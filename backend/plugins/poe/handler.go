package poe

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/blockvantage/chain-app-store/backend/config"
	"github.com/blockvantage/chain-app-store/backend/storage"
	"github.com/blockvantage/chain-app-store/backend/utils"
)

// Plugin implements the Plugin interface for POE (Proof of Engagement) functionality
type Plugin struct{}

// RegisterRoutes registers the POE plugin routes
func RegisterRoutes(router *gin.RouterGroup, db *storage.DB, cfg *config.Config) error {
	// Register routes
	router.POST("/engage", logEngagement(db))
	router.GET("/leaderboard", getLeaderboard(db))
	router.GET("/contributions/:appId", getAppContributions(db))
	
	return nil
}

// Migrate runs the migrations for the POE plugin
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&storage.Point{})
}

// logEngagement handles logging a user engagement with an app
func logEngagement(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			AppID       uint   `json:"appId" binding:"required"`
			UserAddress string `json:"userAddress" binding:"required"`
			Action      string `json:"action" binding:"required"`
			Signature   string `json:"signature" binding:"required"`
			TxHash      string `json:"txHash"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify the signature
		message := "Engage with app " + strconv.Itoa(int(req.AppID)) + " with action " + req.Action
		valid, err := utils.VerifySignature(req.UserAddress, req.Signature, message)
		if err != nil || !valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
			return
		}

		// Check if the app exists
		var app storage.App
		if err := db.First(&app, req.AppID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
			return
		}

		// Determine points based on action
		var points int
		switch req.Action {
		case "visit":
			points = 1
		case "use":
			points = 5
		case "share":
			points = 3
		default:
			points = 1
		}

		// Create the engagement point
		point := storage.Point{
			AppID:       req.AppID,
			UserAddress: req.UserAddress,
			Amount:      points,
			Action:      req.Action,
			TxHash:      req.TxHash,
		}

		if err := db.Create(&point).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to log engagement"})
			return
		}

		c.JSON(http.StatusCreated, point)
	}
}

// getLeaderboard returns the top users by POE points
func getLeaderboard(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Query for total points by user
		type UserPoints struct {
			UserAddress string `json:"userAddress"`
			Total       int    `json:"total"`
		}

		var userPoints []UserPoints
		if err := db.Raw(`
			SELECT user_address, SUM(amount) as total
			FROM points
			GROUP BY user_address
			ORDER BY total DESC
			LIMIT 100
		`).Scan(&userPoints).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"leaderboard": userPoints})
	}
}

// getAppContributions returns the top contributors for a specific app
func getAppContributions(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		appID, err := strconv.ParseUint(c.Param("appId"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid app ID"})
			return
		}

		// Check if the app exists
		var app storage.App
		if err := db.First(&app, appID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
			return
		}

		// Query for total points by user for this app
		type UserContribution struct {
			UserAddress string `json:"userAddress"`
			Total       int    `json:"total"`
		}

		var contributions []UserContribution
		if err := db.Raw(`
			SELECT user_address, SUM(amount) as total
			FROM points
			WHERE app_id = ?
			GROUP BY user_address
			ORDER BY total DESC
			LIMIT 50
		`, appID).Scan(&contributions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"appId":         appID,
			"appName":       app.Name,
			"contributions": contributions,
		})
	}
}
