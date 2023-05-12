package bucket

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"example.com/mainbackend/constants"
	"example.com/mainbackend/db/config"
	"example.com/mainbackend/db/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
)

func CreateBucket(c *gin.Context) {

	bucketCollection := config.GetCollection(config.DB, string(models.BUCKETS))
	renterCollection := config.GetCollection(config.DB, string(models.RENTERS))
	newBucket := models.NewBucketRequestBody{}

	if err := c.BindJSON(&newBucket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	primitiveRenterId, err := primitive.ObjectIDFromHex(newBucket.RenterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	bucketPayload := models.Bucket{
		ID:              primitive.NewObjectID(),
		BucketName:      newBucket.BucketName,
		BucketNameAlias: newBucket.BucketName,
		RenterId:        primitiveRenterId,
		CreationTime:    time.Now(),
		StorageBackend:  constants.WEB3_BACKEND,
		Files:           make([]models.File, 0),
	}

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	transactionOptions := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	session, err := config.DB.StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	defer session.EndSession(context.Background())

	// Transactional
	callback := func(sessionContext mongo.SessionContext) (interface{}, error) {
		// Create bucket in bucket collection
		insertedBucket, err := bucketCollection.InsertOne(sessionContext, bucketPayload)
		if err != nil {
			return nil, err
		}

		// Add bucket in renter collection
		update := bson.M{
			"$inc":  bson.M{"totalBuckets": 1},
			"$push": bson.M{"buckets": insertedBucket.InsertedID},
		}
		updateResult, err := renterCollection.UpdateByID(sessionContext, primitiveRenterId, update)
		if err != nil {
			return nil, err
		}
		fmt.Printf("Updated %v Documents!\n", updateResult.ModifiedCount)

		return insertedBucket, nil
	}

	_, err = session.WithTransaction(context.Background(), callback, transactionOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"message": "New Bucket Created Successfully"})
}

func GetFilesForBucket(c *gin.Context) {

	bucketCollection := config.GetCollection(config.DB, string(models.BUCKETS))
	bucketId := c.Query("bucketId")
	primitiveBucketId, err := primitive.ObjectIDFromHex(bucketId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var bucket models.Bucket
	err = bucketCollection.FindOne(context.Background(), bson.M{"_id": primitiveBucketId}).Decode(&bucket)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, bucket.Files)
}

func GetBucketsForRenter(c *gin.Context) {

	bucketCollection := config.GetCollection(config.DB, string(models.BUCKETS))
	renterId := c.Query("renterId")
	primitiveRenterId, err := primitive.ObjectIDFromHex(renterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var buckets []models.Bucket
	cursor, err := bucketCollection.Find(context.Background(), bson.M{"renterId": primitiveRenterId})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if err = cursor.All(context.Background(), &buckets); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"buckets": buckets})
}

func RemoveFilesFromBucket(c *gin.Context) {

	bucketCollection := config.GetCollection(config.DB, string(models.BUCKETS))
	bucketId := c.Query("bucketId")
	primitiveBucketId, err := primitive.ObjectIDFromHex(bucketId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	update := bson.M{
		"$set": bson.M{"files": make([]models.File, 0)},
	}
	_, err = bucketCollection.UpdateByID(context.Background(), primitiveBucketId, update)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Bucket Emptied Successfully"})
}

func DeleteBucket(c *gin.Context) {

	bucketCollection := config.GetCollection(config.DB, string(models.BUCKETS))
	renterCollection := config.GetCollection(config.DB, string(models.RENTERS))
	bucketId := c.Query("bucketId")
	primitiveBucketId, err := primitive.ObjectIDFromHex(bucketId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	transactionOptions := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	session, err := config.DB.StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	defer session.EndSession(context.Background())

	// Transactional
	callback := func(sessionContext mongo.SessionContext) (interface{}, error) {
		// Delete bucket from bucket collection
		_, err := bucketCollection.DeleteOne(sessionContext, bson.M{"_id": primitiveBucketId})
		if err != nil {
			return nil, err
		}

		// Delete bucket from renter collection
		update := bson.M{
			"$inc":  bson.M{"totalBuckets": -1},
			"$pull": bson.M{"buckets": primitiveBucketId},
		}
		updateResult, err := renterCollection.UpdateOne(sessionContext, bson.M{"buckets": primitiveBucketId}, update)
		if err != nil {
			return nil, err
		}
		fmt.Printf("Updated %v Documents!\n", updateResult.ModifiedCount)

		return nil, nil
	}

	_, err = session.WithTransaction(context.Background(), callback, transactionOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Bucket Deleted Successfully"})
}
