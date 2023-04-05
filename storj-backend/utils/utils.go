package utils

import (
	"context"
	"example/backend/constants"
	"fmt"
	"math/rand"
	"time"

	"storj.io/uplink"
)

func GetStorjAccess() (*uplink.Access, error) {
	access, err := uplink.RequestAccessWithPassphrase(context.Background(), constants.SATELLITE_ADDRESS, constants.STORJ_API_KEY, constants.STORJ_ROOT_PASSPHRASE)
	if err != nil {
		return nil, fmt.Errorf("could not get access grant: %v", err)
	}

	return access, nil
}

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
