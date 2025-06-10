package storage

import (
	"net/http"
	"strconv"

	"github.com/chain-app-store/backend/config"
	"github.com/chain-app-store/backend/utils"
	"github.com/gin-gonic/gin"
)

// GetApps returns all visible apps
func GetApps(db *DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var apps []App
		query := db.Where("hidden = ?", false)

		// Apply filters if provided
		if category := c.Query("category"); category != "" {
			query = query.Where("? = ANY(tags)", category)
		}

		if featured := c.Query("featured"); featured == "true" {
			query = query.Where("featured = ?", true)
		}

		// Apply sorting
		sortBy := c.DefaultQuery("sort", "created_at")
		sortOrder := c.DefaultQuery("order", "desc")
		query = query.Order(sortBy + " " + sortOrder)

		// Apply pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
		offset := (page - 1) * pageSize

		var total int64
		db.Model(&App{}).Where("hidden = ?", false).Count(&total)

		result := query.Offset(offset).Limit(pageSize).Find(&apps)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"apps": apps,
			"pagination": gin.H{
				"total":    total,
				"page":     page,
				"pageSize": pageSize,
				"pages":    (total + int64(pageSize) - 1) / int64(pageSize),
			},
		})
	}
}

// CreateApp creates a new app
func CreateApp(db *DB, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var app App
		if err := c.ShouldBindJSON(&app); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify listing fee transaction if required
		if app.TxHash == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "listing fee transaction hash is required"})
			return
		}

		// In a real implementation, we would verify the transaction on the blockchain
		// For now, we'll just save the transaction
		tx := Transaction{
			Hash:        app.TxHash,
			FromAddress: app.DeveloperAddress,
			ToAddress:   "platform_address", // This would come from config in real implementation
			Value:       cfg.ListingFee.Amount,
			TokenSymbol: cfg.ListingFee.Token,
			Type:        "listing",
			Status:      "confirmed", // In reality, we would check the status on the blockchain
		}

		if err := db.Create(&tx).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record transaction"})
			return
		}

		// Create the app
		if err := db.Create(&app).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create app"})
			return
		}

		// Update the transaction with the app ID
		if err := db.Model(&tx).Update("app_id", app.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update transaction"})
			return
		}

		c.JSON(http.StatusCreated, app)
	}
}

// FeatureApp marks an app as featured
func FeatureApp(db *DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			AppID    uint `json:"appId" binding:"required"`
			Featured bool `json:"featured"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var app App
		if err := db.First(&app, req.AppID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
			return
		}

		if err := db.Model(&app).Update("featured", req.Featured).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update app"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}

// HideApp hides or unhides an app
func HideApp(db *DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			AppID  uint `json:"appId" binding:"required"`
			Hidden bool `json:"hidden"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var app App
		if err := db.First(&app, req.AppID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
			return
		}

		if err := db.Model(&app).Update("hidden", req.Hidden).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update app"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}

// AdminAuthMiddleware verifies that the request is from an admin
func AdminAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get signature from header
		signature := c.GetHeader("X-Admin-Signature")
		if signature == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "admin signature required"})
			return
		}

		// Get wallet address from signature
		// In a real implementation, we would verify the signature
		// For now, we'll just check if the address is in the admin list
		walletAddress, err := utils.RecoverAddressFromSignature(signature, "message")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
			return
		}

		if !cfg.IsAdminWallet(walletAddress) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "not an admin wallet"})
			return
		}

		c.Next()
	}
}
