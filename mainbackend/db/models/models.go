package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type File struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Name           string             `bson:"name"`
	UploadDateTime time.Time          `bson:"uploadDateTime"`
	Cid            string             `bson:"cid"`
	SizeInGB       float64            `bson:"sizeInGB"`
	Type           string             `bson:"type"`
}

type Bucket struct {
	ID               primitive.ObjectID `bson:"_id,omitempty"`
	BucketName       string             `bson:"bucketName" json:"bucketName"`
	BucketNameAlias  string             `bson:"bucketNameAlias"`
	RenterId         primitive.ObjectID `bson:"renterId" json:"renterId"`
	CreationTime     time.Time          `bson:"creationTime"`
	StorageBackend   string             `bson:"storageBackend" json:"storageBackend"`
	TotalStorageUsed float64            `bson:"totalStorageUsed"`
	Files            []File             `bson:"files"`
}

type NewRenterRequestBody struct {
	FirstName string `bson:"firstName" json:"firstName"`
	LastName  string `bson:"lastName" json:"lastName"`
	Email     string `bson:"email" json:"email"`
	Password  string `bson:"password" json:"password"`
	Mobile    string `bson:"mobile" json:"mobile"`
	Location  string `bson:"location" json:"location"`
}

type UpdateRenterRequestBody struct {
	RenterId  string `json:"renterId"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	// Password  string `bson:"password" json:"password"`
	Mobile   string `bson:"mobile" json:"mobile"`
	Location string `bson:"location" json:"location"`
}

type LoginRenterRequestBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Renter struct {
	ID                 primitive.ObjectID   `bson:"_id,omitempty"`
	Name               string               `bson:"name"`
	Username           string               `bson:"username"`
	Email              string               `bson:"email"`
	Password           string               `bson:"password"`
	Mobile             string               `bson:"mobile"`
	Location           string               `bson:"location"`
	Buckets            []primitive.ObjectID `bson:"buckets"`
	TotalBuckets       int                  `bson:"totalBuckets"`
	TotalNumberOfFiles int                  `bson:"totalNumberOfFiles"`
	TotalBandwidth     float64              `bson:"totalBandwidth"`
	TotalStorageUsed   float64              `bson:"totalStorageUsed"`
}

type DailyStorageTrend struct {
	Day       time.Time `bson:"day"`
	ValueInGB float64   `bson:"valueInGB"`
}

type DailyBandwidthTrend struct {
	Day       time.Time `bson:"day"`
	ValueInGB float64   `bson:"valueInGB"`
}

type RenterMetrics struct {
	ID                   primitive.ObjectID  `bson:"_id,omitempty"`
	RenterId             primitive.ObjectID  `bson:"renterID"`
	DailyStorageTrends   []DailyStorageTrend `bson:"dailyStorageTrends"`
	DailyBandwidthTrends []DailyStorageTrend `bson:"dailyBandwidthTrends"`
}
