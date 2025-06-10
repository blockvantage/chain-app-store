package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

// Config represents the structure of the config.json file
type Config struct {
	ChainName       string            `json:"chainName"`
	PrimaryToken    string            `json:"primaryToken"`
	RpcUrl          string            `json:"rpcUrl"`
	ExplorerUrl     string            `json:"explorerUrl"`
	Logos           LogoConfig        `json:"logos"`
	BoostingFeeSplit FeeSplitConfig   `json:"boostingFeeSplit"`
	EnableModules   ModulesConfig     `json:"enableModules"`
	AdminWallets    []string          `json:"adminWallets"`
	ListingFee      ListingFeeConfig  `json:"listingFee"`
}

type LogoConfig struct {
	Light string `json:"light"`
	Dark  string `json:"dark"`
}

type FeeSplitConfig struct {
	Platform int `json:"platform"`
	Deployer int `json:"deployer"`
}

type ModulesConfig struct {
	Poe      bool `json:"poe"`
	Boosting bool `json:"boosting"`
	Reviews  bool `json:"reviews"`
}

type ListingFeeConfig struct {
	Amount string `json:"amount"`
	Token  string `json:"token"`
}

func main() {
	log.Println("Starting init container...")
	
	// Get environment variables
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "/app/config.json"
	}
	
	sharedPath := os.Getenv("SHARED_PATH")
	if sharedPath == "" {
		sharedPath = "/shared"
	}
	
	// Read config file
	log.Printf("Reading config from %s", configPath)
	configData, err := ioutil.ReadFile(configPath)
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}
	
	// Parse config
	var config Config
	if err := json.Unmarshal(configData, &config); err != nil {
		log.Fatalf("Error parsing config JSON: %v", err)
	}
	
	// Validate config
	if err := validateConfig(config); err != nil {
		log.Fatalf("Config validation failed: %v", err)
	}
	
	// Ensure shared directory exists
	if err := os.MkdirAll(sharedPath, 0755); err != nil {
		log.Fatalf("Error creating shared directory: %v", err)
	}
	
	// Write validated config to shared volume
	outputPath := filepath.Join(sharedPath, "config.json")
	log.Printf("Writing validated config to %s", outputPath)
	
	outputData, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		log.Fatalf("Error marshaling config: %v", err)
	}
	
	if err := ioutil.WriteFile(outputPath, outputData, 0644); err != nil {
		log.Fatalf("Error writing config: %v", err)
	}
	
	log.Println("Init container completed successfully")
}

func validateConfig(config Config) error {
	// Basic validation
	if config.ChainName == "" {
		return fmt.Errorf("chainName is required")
	}
	
	if config.RpcUrl == "" {
		return fmt.Errorf("rpcUrl is required")
	}
	
	if config.ExplorerUrl == "" {
		return fmt.Errorf("explorerUrl is required")
	}
	
	// Validate fee split adds up to 100%
	if config.BoostingFeeSplit.Platform+config.BoostingFeeSplit.Deployer != 100 {
		return fmt.Errorf("boostingFeeSplit must add up to 100 (got platform: %d, deployer: %d)", 
			config.BoostingFeeSplit.Platform, config.BoostingFeeSplit.Deployer)
	}
	
	// Validate at least one admin wallet is defined
	if len(config.AdminWallets) == 0 {
		return fmt.Errorf("at least one adminWallet must be defined")
	}
	
	return nil
}
