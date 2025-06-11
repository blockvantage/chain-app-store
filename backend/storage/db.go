package storage

import (
	"fmt"
	"log"

	"github.com/blockvantage/chain-app-store/backend/config"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is a wrapper around gorm.DB
type DB struct {
	*gorm.DB
}

// InitDB initializes the SQLite database
func InitDB(dbPath string) (*DB, error) {
	log.Printf("Initializing database at %s", dbPath)
	
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return &DB{DB: db}, nil
}

// RunMigrations runs the database migrations
func RunMigrations(db *DB, cfg *config.Config) error {
	log.Println("Running database migrations...")
	
	// Auto-migrate the schema
	if err := db.AutoMigrate(&App{}, &Transaction{}, &AppImage{}, &Flag{}); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Migrate plugin-specific tables based on enabled modules
	if cfg.EnableModules.Reviews {
		if err := db.AutoMigrate(&Review{}); err != nil {
			return fmt.Errorf("failed to migrate reviews table: %w", err)
		}
	}

	if cfg.EnableModules.Poe {
		if err := db.AutoMigrate(&Point{}); err != nil {
			return fmt.Errorf("failed to migrate points table: %w", err)
		}
	}

	if cfg.EnableModules.Boosting {
		if err := db.AutoMigrate(&Boost{}); err != nil {
			return fmt.Errorf("failed to migrate boosts table: %w", err)
		}
	}

	log.Println("Database migrations completed successfully")
	return nil
}
