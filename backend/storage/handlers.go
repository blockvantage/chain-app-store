package storage

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

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

		// Check if we should include mockup images
		includeImages := c.Query("includeImages") == "true"
		if includeImages {
			query = query.Preload("MockupImages")
		}

		result := query.Offset(offset).Limit(pageSize).Find(&apps)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		// If images are included but we don't want to send the binary data in the list view
		// we can strip it out here and just send metadata
		if includeImages && c.Query("imagesMetadataOnly") == "true" {
			for i := range apps {
				for j := range apps[i].MockupImages {
					// Keep metadata but remove the actual image data
					apps[i].MockupImages[j].ImageData = nil
				}
			}
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
		// Parse multipart form with 10MB max memory
		if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse form data: " + err.Error()})
			return
		}

		// Get app data from form
		appJSON := c.Request.FormValue("appData")
		if appJSON == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "app data is required"})
			return
		}

		var app App
		if err := json.Unmarshal([]byte(appJSON), &app); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid app data: " + err.Error()})
			return
		}

		// // Verify listing fee transaction if required
		// if app.TxHash == "" {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": "listing fee transaction hash is required"})
		// 	return
		// }

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

		// Create the app first to get an ID
		if err := db.Create(&app).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create app"})
			return
		}

		// Update the transaction with the app ID
		if err := db.Model(&tx).Update("app_id", app.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update transaction"})
			return
		}

		// Process mockup images
		form, _ := c.MultipartForm()
		files := form.File["mockupImages"]
		for i, file := range files {
			// Open the uploaded file
			src, err := file.Open()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open uploaded file"})
				return
			}
			defer src.Close()

			// Read the file content
			fileBytes, err := io.ReadAll(src)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read uploaded file"})
				return
			}

			// Get content type
			contentType := file.Header.Get("Content-Type")
			if contentType == "" {
				// Try to detect content type if not provided
				contentType = http.DetectContentType(fileBytes)
			}

			// Validate that it's an image
			if !strings.HasPrefix(contentType, "image/") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "uploaded file is not an image"})
				return
			}

			// Create AppImage record
			appImage := AppImage{
				AppID:       app.ID,
				ImageData:   fileBytes,
				ContentType: contentType,
				Filename:    file.Filename,
				Order:       i, // Use the upload order as display order
				Description: c.Request.FormValue(fmt.Sprintf("imageDescription[%d]", i)),
			}

			if err := db.Create(&appImage).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
				return
			}
		}

		// Fetch the complete app with images for the response
		var completeApp App
		if err := db.Preload("MockupImages").First(&completeApp, app.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch complete app data"})
			return
		}

		c.JSON(http.StatusCreated, completeApp)
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

// GetAppImage returns a specific mockup image by ID
func GetAppImage(db *DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("id")
		if imageID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "image ID is required"})
			return
		}

		var image AppImage
		if err := db.First(&image, imageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
			return
		}

		// Set appropriate content type header
		c.Header("Content-Type", image.ContentType)
		c.Header("Content-Disposition", fmt.Sprintf("inline; filename=%s", image.Filename))
		
		// Return the image data directly
		c.Data(http.StatusOK, image.ContentType, image.ImageData)
	}
}

// GetApp returns a specific app by ID with its mockup images
func GetApp(db *DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		appID := c.Param("id")
		if appID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "app ID is required"})
			return
		}

		var app App
		
		// Check if we should include mockup images
		includeImages := c.Query("includeImages") == "true"
		query := db.Model(&App{})
		
		if includeImages {
			query = query.Preload("MockupImages")
		}
		
		if err := query.First(&app, appID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
			return
		}

		// If images are included but we don't want to send the binary data
		if includeImages && c.Query("imagesMetadataOnly") == "true" {
			for i := range app.MockupImages {
				// Keep metadata but remove the actual image data
				app.MockupImages[i].ImageData = nil
			}
		}

		c.JSON(http.StatusOK, app)
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
