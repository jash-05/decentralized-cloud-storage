package utils

import (
	"context"
	"example/backend/constants"
	"fmt"

	"storj.io/uplink"
)

func GetStorjAccess() (*uplink.Access, error) {
	access, err := uplink.RequestAccessWithPassphrase(context.Background(), constants.SATELLITE_ADDRESS, constants.STORJ_API_KEY, constants.STORJ_ROOT_PASSPHRASE)
	if err != nil {
		return nil, fmt.Errorf("could not get access grant: %v", err)
	}

	return access, nil
}
