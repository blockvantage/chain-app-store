package reviews

import (
	"net/http"
	"strconv"

	"github.com/chain-app-store/backend/config"
	"github.com/chain-app-store/backend/storage"
	"github.com/chain-app-store/backend/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Plugin implements the Plugin interface for reviews functionality
type Plugin struct{}

// RegisterRoutes registers the reviews plugin routes
func RegisterRoutes(router *gin.Engine, db *storage.DB, cfg *config.Config) error {
	// Register routes
	router.POST("/review", createReview(db))
	router.GET("/reviews/:appId", getAppReviews(db))
	
	// Admin routes for review moderation
	admin := router.Group("/admin")
	admin.Use(storage.AdminAuthMiddleware(cfg))
	{
		admin.POST("/review/hide", hideReview(db))
	}
	
	return nil
}

// Migrate runs the migrations for the reviews plugin
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&storage.Review{})
}

// createReview handles the creation of a new review
func createReview(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			AppID       uint   `json:"appId" binding:"required"`
			UserAddress string `json:"userAddress" binding:"required"`
			Rating      int    `json:"rating" binding:"required,min=1,max=5"`
			Comment     string `json:"comment"`
			Signature   string `json:"signature" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify the signature
		message := "Review app " + strconv.Itoa(int(req.AppID)) + " with rating " + strconv.Itoa(req.Rating)
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

		// Check if the user has already reviewed this app
		var existingReview storage.Review
		result := db.Where("app_id = ? AND user_address = ?", req.AppID, req.UserAddress).First(&existingReview)
		if result.Error == nil {
			// Update the existing review
			existingReview.Rating = req.Rating
			existingReview.Comment = req.Comment
			existingReview.Signature = req.Signature

			if err := db.Save(&existingReview).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update review"})
				return
			}

			c.JSON(http.StatusOK, existingReview)
			return
		}

		// Create a new review
		review := storage.Review{
			AppID:       req.AppID,
			UserAddress: req.UserAddress,
			Rating:      req.Rating,
			Comment:     req.Comment,
			Signature:   req.Signature,
			Hidden:      false,
		}

		if err := db.Create(&review).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
			return
		}

		c.JSON(http.StatusCreated, review)
	}
}

// getAppReviews returns all reviews for an app
func getAppReviews(db *storage.DB) gin.HandlerFunc {
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

		// Get all visible reviews for the app
		var reviews []storage.Review
		if err := db.Where("app_id = ? AND hidden = ?", appID, false).Find(&reviews).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Calculate average rating
		var totalRating int
		for _, review := range reviews {
			totalRating += review.Rating
		}

		var avgRating float64
		if len(reviews) > 0 {
			avgRating = float64(totalRating) / float64(len(reviews))
		}

		c.JSON(http.StatusOK, gin.H{
			"reviews":     reviews,
			"count":       len(reviews),
			"avgRating":   avgRating,
		})
	}
}

// hideReview hides or unhides a review (admin only)
func hideReview(db *storage.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ReviewID uint `json:"reviewId" binding:"required"`
			Hidden   bool `json:"hidden"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var review storage.Review
		if err := db.First(&review, req.ReviewID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
			return
		}

		if err := db.Model(&review).Update("hidden", req.Hidden).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update review"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}
