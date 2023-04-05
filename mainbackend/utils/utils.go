package utils

import (
	"math/rand"
	"time"
)

func GenerateRandomCharsetId() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	const length = 8

	var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}
