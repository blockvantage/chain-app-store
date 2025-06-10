package utils

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/crypto"
)

// RecoverAddressFromSignature recovers the Ethereum address that signed a message
func RecoverAddressFromSignature(signature, message string) (string, error) {
	// Remove "0x" prefix if present
	signature = strings.TrimPrefix(signature, "0x")

	// Decode the signature
	sig, err := hex.DecodeString(signature)
	if err != nil {
		return "", fmt.Errorf("failed to decode signature: %w", err)
	}

	// Check signature length
	if len(sig) != 65 {
		return "", fmt.Errorf("invalid signature length: got %d, want 65", len(sig))
	}

	// Adjust V value (last byte)
	if sig[64] < 27 {
		sig[64] += 27
	}

	// Prepare the message hash
	msgHash := crypto.Keccak256Hash([]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)))

	// Recover the public key
	pubKey, err := crypto.SigToPub(msgHash.Bytes(), sig)
	if err != nil {
		return "", fmt.Errorf("failed to recover public key: %w", err)
	}

	// Derive the address from the public key
	address := crypto.PubkeyToAddress(*pubKey)
	return address.Hex(), nil
}

// VerifySignature verifies that a signature was created by the specified address
func VerifySignature(address, signature, message string) (bool, error) {
	recoveredAddress, err := RecoverAddressFromSignature(signature, message)
	if err != nil {
		return false, err
	}

	// Normalize addresses for comparison
	normalizedAddress := strings.ToLower(address)
	normalizedRecovered := strings.ToLower(recoveredAddress)

	return normalizedAddress == normalizedRecovered, nil
}

// SignMessage signs a message with a private key (for testing purposes)
func SignMessage(privateKeyHex, message string) (string, error) {
	// Remove "0x" prefix if present
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")

	// Decode the private key
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("failed to decode private key: %w", err)
	}

	// Parse the private key
	privateKey, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		return "", fmt.Errorf("failed to parse private key: %w", err)
	}

	// Prepare the message hash
	msgHash := crypto.Keccak256Hash([]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)))

	// Sign the message
	sig, err := crypto.Sign(msgHash.Bytes(), privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign message: %w", err)
	}

	// Return the signature as a hex string
	return "0x" + hex.EncodeToString(sig), nil
}

// GetAddressFromPrivateKey derives an Ethereum address from a private key
func GetAddressFromPrivateKey(privateKeyHex string) (string, error) {
	// Remove "0x" prefix if present
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")

	// Decode the private key
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("failed to decode private key: %w", err)
	}

	// Parse the private key
	privateKey, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		return "", fmt.Errorf("failed to parse private key: %w", err)
	}

	// Get the public key
	publicKey := privateKey.Public().(*ecdsa.PublicKey)

	// Derive the address
	address := crypto.PubkeyToAddress(*publicKey)
	return address.Hex(), nil
}
