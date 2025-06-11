package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
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
	BackendUrl      string            `json:"backendUrl"`
	Storage         StorageConfig     `json:"storage"`
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

// PublicConfig is a subset of Config that is safe to expose to the frontend
type PublicConfig struct {
	ChainName       string            `json:"chainName"`
	PrimaryToken    string            `json:"primaryToken"`
	RpcUrl          string            `json:"rpcUrl"`
	ExplorerUrl     string            `json:"explorerUrl"`
	Logos           LogoConfig        `json:"logos"`
	EnableModules   ModulesConfig     `json:"enableModules"`
	ListingFee      ListingFeeConfig  `json:"listingFee"`
}

// LoadConfig loads the configuration from the specified path
func LoadConfig(path string) (*Config, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config JSON: %w", err)
	}

	return &config, nil
}

// GetPublicConfig returns a public-safe version of the config
func (c *Config) GetPublicConfig() PublicConfig {
	return PublicConfig{
		ChainName:     c.ChainName,
		PrimaryToken:  c.PrimaryToken,
		RpcUrl:        c.RpcUrl,
		ExplorerUrl:   c.ExplorerUrl,
		Logos:         c.Logos,
		EnableModules: c.EnableModules,
		ListingFee:    c.ListingFee,
	}
}

// IsAdminWallet checks if the given wallet address is an admin
func (c *Config) IsAdminWallet(wallet string) bool {
	for _, admin := range c.AdminWallets {
		if admin == wallet {
			return true
		}
	}
	return false
}
