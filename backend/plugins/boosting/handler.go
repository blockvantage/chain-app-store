package boosting

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/blockvantage/chain-app-store/backend/config"
	"github.com/blockvantage/chain-app-store/backend/storage"
	"github.com/blockvantage/chain-app-store/backend/utils"
)

// Plugin implements the Plugin interface for boosting functionality
type Plugin struct{}

// RegisterRoutes registers the boosting plugin routes
func RegisterRoutes(router *gin.RouterGroup, db *storage.DB, cfg *config.Config) error {
	// Register routes
	router.POST("/boost", createBoost(db, cfg))
	router.GET("/boosted", getBoostedApps(db))
	
	return nil
}

// Migrate runs the migrations for the boosting plugin
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&storage.Boost{})
}

// createBoost handles the creation of a new boost
func createBoost(db *storage.DB, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			AppID       uint   `json:"appId" binding:"required"`
			Amount      string `json:"amount" binding:"required"`
			TokenSymbol string `json:"tokenSymbol" binding:"required"`
			TxHash      string `json:"txHash" binding:"required"`
			Signature   string `json:"signature" binding:"required"`
			UserAddress string `json:"userAddress" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify the signature
		message := "Boost app " + strconv.Itoa(int(req.AppID)) + " with " + req.Amount + " " + req.TokenSymbol
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

		// In a real implementation, we would verify the transaction on the blockchain
		// For now, we'll just save the transaction
		tx := storage.Transaction{
			Hash:        req.TxHash,
			FromAddress: req.UserAddress,
			ToAddress:   "platform_address", // This would come from config in real implementation
			Value:       req.Amount,
			TokenSymbol: req.TokenSymbol,
			Type:        "boosting",
			AppID:       req.AppID,
			Status:      "confirmed", // In reality, we would check the status on the blockchain
		}

		if err := db.Create(&tx).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record transaction"})
			return
		}

		// Create the boost
		boost := storage.Boost{
			AppID:       req.AppID,
			UserAddress: req.UserAddress,
			Amount:      req.Amount,
			TokenSymbol: req.TokenSymbol,
			TxHash:      req.TxHash,
			ExpiresAt:   time.Now().AddDate(0, 1, 0), // Boost expires in 1 month
		}

		if err := db.Create(&boost).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create boost"})
			return
		}

		c.JSON(http.StatusCreated, boost)
	}
}

// getBoostedApps returns apps sorted by boost amount
func getBoostedApps(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get current time
		now := time.Now()

		// Query for active boosts and sum them by app
		type BoostSum struct {
			AppID uint    `json:"appId"`
			Total float64 `json:"total"`
		}

		var boostSums []BoostSum
		if err := db.Raw(`
			SELECT app_id, SUM(CAST(amount AS REAL)) as total
			FROM boosts
			WHERE expires_at > ?
			GROUP BY app_id
			ORDER BY total DESC
		`, now).Scan(&boostSums).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Get the apps with their boost totals
		var boostedApps []struct {
			storage.App
			BoostTotal float64 `json:"boostTotal"`
		}

		for _, boost := range boostSums {
			var app storage.App
			if err := db.First(&app, boost.AppID).Error; err != nil {
				continue
			}

			boostedApps = append(boostedApps, struct {
				storage.App
				BoostTotal float64 `json:"boostTotal"`
			}{
				App:        app,
				BoostTotal: boost.Total,
			})
		}

		c.JSON(http.StatusOK, gin.H{"apps": boostedApps})
	}
}
