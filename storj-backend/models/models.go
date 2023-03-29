package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Renter metrics:

// - _id: [Mongo ObjectID]
// - renterID: [Mongo ObjectID from Renter collection]
// - dailyStorageTrends: [{

//       day: String [date in string, eg. 03/23/2023],

//       valueInGB: Number [eg. 12.1]
//     }]

// - dailyBandwidthTrends: [{

//       day: String [date in string, eg. 03/23/2023],

//       valueInGB: Number [eg. 12.1]
//     }]

type File struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Name           string             `bson:"name"`
	UploadDateTime time.Time          `bson:"uploadDateTime"`
	Cid            string             `bson:"cid"`
	SizeInGB       float64            `bson:"sizeInGB"`
	Type           string             `bson:"type"`
}

type Bucket struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	BucketName     string             `bson:"bucketName"`
	RenterId       primitive.ObjectID `bson:"renterId"`
	CreationTime   time.Time          `bson:"creationTime"`
	StorageBackend string             `bson:"storageBackend"`
	Files          []File             `bson:"files"`
}

type Renter struct {
	ID                 primitive.ObjectID   `bson:"_id,omitempty"`
	Name               string               `bson:"name"`
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
