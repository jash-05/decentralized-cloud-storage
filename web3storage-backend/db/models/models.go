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

type NewBucketRequestBody struct {
	BucketName string `json:bucketName`
	RenterId   string `json:renterId`
}

type Bucket struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	BucketName     string             `bson:"bucketName" json:bucketName`
	RenterId       primitive.ObjectID `bson:"renterId" json:renterId`
	CreationTime   time.Time          `bson:"creationTime"`
	StorageBackend string             `bson:"storageBackend" json:storageBackend`
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

type CollectionName string

const (
	RENTERS CollectionName = "renters"
	BUCKETS CollectionName = "buckets"
)
