package bucket

import (
	"context"
	"encoding/json"
	"example/backend/constants"
	"example/backend/db/config"
	"example/backend/db/models"
	"example/backend/utils"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
	"storj.io/uplink"
)

func createBucketStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string) error {

	fmt.Println(bucketName)
	// Open up the project we will be working with.
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	bucket, err := project.CreateBucket(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("could not create bucket: %v", err)
	}

	fmt.Println("Bucket created successfully on Storj: ", bucket.Name)
	return nil
}

func CreateBucket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Create Bucket Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	r.ParseForm()
	originalBucketName := r.Form.Get("bucketName")
	fmt.Println("Original bucket name: ", originalBucketName)

	renterIdString := r.Form.Get("renterId")
	renterIdObjectId, err := primitive.ObjectIDFromHex(renterIdString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing to ObjectID: " + err.Error()))
		return
	}

	renter := models.Renter{}
	renterFilter := bson.D{{Key: "_id", Value: renterIdObjectId}}
	renterCollection := config.GetCollection(config.DB, "renters")
	renterObj := renterCollection.FindOne(context.TODO(), renterFilter)
	err = renterObj.Decode(&renter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Renter fetching from MongoDB failed: " + err.Error()))
		return
	}

	username := renter.Username
	bucketNameOnStorj := username + "-" + strings.ToLower(originalBucketName)
	fmt.Println("Bucket name on Storj: ", bucketNameOnStorj)

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	transactionOptions := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	bucketCollection := config.GetCollection(config.DB, "buckets")

	bucketObj := models.Bucket{BucketName: bucketNameOnStorj, BucketNameAlias: originalBucketName, RenterId: renterIdObjectId, CreationTime: time.Now(), StorageBackend: constants.STORJ_STORAGE_BACKEND, Files: []models.File{}}

	session, err := config.DB.StartSession()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error creating a transaction session: " + err.Error()))
		return
	}

	defer session.EndSession(context.TODO())

	// Transaction
	callback := func(sessionContext mongo.SessionContext) (interface{}, error) {
		// Create bucket in bucket collection
		newInsertedBucket, err := bucketCollection.InsertOne(sessionContext, bucketObj)
		if err != nil {
			return nil, fmt.Errorf("error creating new bucket object in bucket collection: %v", err)
		}
		newInsertedBucketId := newInsertedBucket.InsertedID.(primitive.ObjectID)

		// Add bucket in renter collection
		renterDocumentUpdateResult, err := renterCollection.UpdateByID(
			sessionContext,
			renterIdObjectId,
			bson.M{"$push": bson.M{"buckets": newInsertedBucketId}, "$inc": bson.M{"totalBuckets": 1}},
		)
		if err != nil {
			return nil, fmt.Errorf("error updating bucket info in renter document: %v", err)
		}
		fmt.Println("Updated renter document fields: ", renterDocumentUpdateResult.ModifiedCount)

		// Setup storj access object
		access, err := utils.GetStorjAccess()
		if err != nil {
			return nil, fmt.Errorf("access to uplink failed: %v", err)
		}

		// Create bucket on storj
		err = createBucketStorjHelper(context.Background(), access, bucketNameOnStorj)
		if err != nil {
			return nil, fmt.Errorf("error creating bucket on storj: %v", err)
		}

		return newInsertedBucket.InsertedID, nil
	}

	newInsertedBucketId, err := session.WithTransaction(context.Background(), callback, transactionOptions)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Create bucket transaction failed: " + err.Error()))
		return
	} else {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")

		response := make(map[string]string)
		response["bucketId"] = newInsertedBucketId.(primitive.ObjectID).Hex()
		jsonResp, _ := json.Marshal(response)

		w.Write(jsonResp)
		return
	}
}

func GetBucketsForRenter(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Get Buckets for Renter Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	r.ParseForm()
	renterIdString := r.Form.Get("renterId")
	renterIdObjectId, err := primitive.ObjectIDFromHex(renterIdString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing to ObjectID: " + err.Error()))
		return
	}

	bucketCollection := config.GetCollection(config.DB, "buckets")

	var buckets []models.Bucket
	cursor, err := bucketCollection.Find(context.Background(), bson.M{"renterId": renterIdObjectId})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error finding documents in bucket collcetion: " + err.Error()))
		return
	}

	/*
		If the number and size of documents returned by your query exceeds available application memory,
		your program will crash using cursor.All() method.
		If you except a large result set, you should consume your cursor iteratively.
	*/
	for cursor.Next(context.TODO()) {
		var bucket models.Bucket
		err := cursor.Decode(&bucket)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Error decoding bucket document: " + err.Error()))
			return
		}
		buckets = append(buckets, bucket)
	}

	/*
		When your application no longer needs to use a cursor, close the cursor with the Close() method.
		This method frees the resources your cursor consumes in both the client application and the MongoDB server.
	*/
	defer cursor.Close(context.TODO())

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	jsonResp, _ := json.MarshalIndent(buckets, "", "  ")
	w.Write(jsonResp)
}

func GetFilesForBucket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Get Files of Bucket for Renter Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	r.ParseForm()
	bucketIdString := r.Form.Get("bucketId")
	bucketIdObjectId, err := primitive.ObjectIDFromHex(bucketIdString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing to ObjectID: " + err.Error()))
		return
	}

	bucketCollection := config.GetCollection(config.DB, "buckets")

	var bucket models.Bucket
	err = bucketCollection.FindOne(context.Background(), bson.M{"_id": bucketIdObjectId}).Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error finding bucket document in bucket collection: " + err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	jsonResp, _ := json.MarshalIndent(bucket.Files, "", "  ")
	w.Write(jsonResp)
}

// TODO: Empty bucket [mongo]
// TODO: Empty bucket storj helper

// TODO: Delete bucket [mongo]
// TODO: Delete bucket storj helper
