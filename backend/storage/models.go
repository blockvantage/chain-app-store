package storage

import (
	"time"

	"gorm.io/gorm"
)

// App represents an application in the app store
type App struct {
	gorm.Model
	Name          string `json:"name" gorm:"index"`
	Description   string `json:"description"`
	ContractAddresses []string `json:"contractAddresses" gorm:"serializer:json"`
	RepoURL       string `json:"repoUrl"`
	WebsiteURL    string `json:"websiteUrl"`
	Tags          []string `json:"tags" gorm:"serializer:json"`
	TxHash        string `json:"txHash"` // Transaction hash for listing fee
	DeveloperAddress string `json:"developerAddress" gorm:"index"`
	Featured      bool `json:"featured" gorm:"index"`
	Hidden        bool `json:"hidden" gorm:"index"`
	LogoPath      string `json:"logoPath"`
	MockupImages  []AppImage `json:"mockupImages" gorm:"foreignKey:AppID"`
	
	// Social media links
	TwitterURL   string `json:"twitterUrl"`
	DiscordURL   string `json:"discordUrl"`
	TelegramURL  string `json:"telegramUrl"`
	MediumURL    string `json:"mediumUrl"`
	GithubURL    string `json:"githubUrl"`
}

// AppImage represents a mockup image for an app
type AppImage struct {
	gorm.Model
	AppID       uint   `json:"appId" gorm:"index"`
	Filename    string `json:"filename"`
	ImagePath   string `json:"imagePath"`
	Description string `json:"description"`                      // Optional description of the image
	Order       int    `json:"order"`                           // Display order
}

// Transaction represents a blockchain transaction
type Transaction struct {
	gorm.Model
	Hash          string `json:"hash" gorm:"uniqueIndex"`
	FromAddress   string `json:"fromAddress" gorm:"index"`
	ToAddress     string `json:"toAddress" gorm:"index"`
	Value         string `json:"value"`
	TokenSymbol   string `json:"tokenSymbol"`
	Type          string `json:"type" gorm:"index"` // listing, boosting, etc.
	AppID         uint   `json:"appId" gorm:"index"`
	Status        string `json:"status" gorm:"index"` // pending, confirmed, failed
}

// Flag represents a moderation flag for content
type Flag struct {
	gorm.Model
	Type          string `json:"type" gorm:"index"` // app, review, etc.
	ContentID     uint   `json:"contentId" gorm:"index"`
	ReporterAddress string `json:"reporterAddress"`
	Reason        string `json:"reason"`
	Resolved      bool   `json:"resolved" gorm:"index"`
	ResolvedBy    string `json:"resolvedBy"`
}

// Review represents a user review of an app (only if reviews module is enabled)
type Review struct {
	gorm.Model
	AppID         uint   `json:"appId" gorm:"index"`
	UserAddress   string `json:"userAddress" gorm:"index"`
	Rating        int    `json:"rating" gorm:"index"` // 1-5 stars
	Comment       string `json:"comment"`
	Signature     string `json:"signature"` // Signature to verify the review is from the user
	Hidden        bool   `json:"hidden" gorm:"index"`
}

// Point represents a POE (Proof of Engagement) point (only if POE module is enabled)
type Point struct {
	gorm.Model
	AppID         uint   `json:"appId" gorm:"index"`
	UserAddress   string `json:"userAddress" gorm:"index"`
	Amount        int    `json:"amount"`
	Action        string `json:"action"` // visit, use, share, etc.
	TxHash        string `json:"txHash"` // Optional: transaction hash if relevant
}

// Boost represents a boost for an app (only if boosting module is enabled)
type Boost struct {
	gorm.Model
	AppID         uint   `json:"appId" gorm:"index"`
	UserAddress   string `json:"userAddress" gorm:"index"`
	Amount        string `json:"amount"`
	TokenSymbol   string `json:"tokenSymbol"`
	TxHash        string `json:"txHash" gorm:"uniqueIndex"`
	ExpiresAt     time.Time `json:"expiresAt" gorm:"index"`
}
