package filestore

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/blockvantage/chain-app-store/backend/config"
)

type FileStore struct {
	config *config.Config
}

func New(cfg *config.Config) *FileStore {
	return &FileStore{
		config: cfg,
	}
}

// SaveImage saves an image file to disk and returns its path
func (fs *FileStore) SaveImage(file *multipart.FileHeader, subdir string) (string, error) {
	// Create the images directory if it doesn't exist
	imagesPath := fs.config.Storage.ImagesPath
	if err := os.MkdirAll(imagesPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create base images directory: %w", err)
	}

	// Create subdirectory if specified
	if subdir != "" {
		imagesPath = filepath.Join(imagesPath, subdir)
		if err := os.MkdirAll(imagesPath, 0755); err != nil {
			return "", fmt.Errorf("failed to create images subdirectory: %w", err)
		}
	}

	// Generate a unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), strings.TrimSuffix(filepath.Base(file.Filename), ext), ext)
	fullPath := filepath.Join(imagesPath, filename)

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Create the destination file
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy the file
	if _, err = io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to copy file: %w", err)
	}

	// Return the relative path from the base images directory
	return filepath.Join(subdir, filename), nil
}

// GetImagePath returns the full path to an image
func (fs *FileStore) GetImagePath(relativePath string) string {
	return filepath.Join(fs.config.Storage.ImagesPath, relativePath)
}

// DeleteImage deletes an image file
func (fs *FileStore) DeleteImage(relativePath string) error {
	fullPath := fs.GetImagePath(relativePath)
	if err := os.Remove(fullPath); err != nil {
		return fmt.Errorf("failed to delete image: %w", err)
	}
	return nil
}
