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

	bucketObj := models.Bucket{BucketName: bucketNameOnStorj, BucketNameAlias: originalBucketName, RenterId: renterIdObjectId, CreationTime: time.Now(), StorageBackend: constants.STORJ_STORAGE_BACKEND, TotalStorageUsed: float64(0), Files: []models.File{}}

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

func emptyBucketStorjHelper(ctx context.Context, access *uplink.Access, bucketName string, objectKey string) error {

	fmt.Println("Deleting file from bucket: ", objectKey)
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	// time.Sleep(10 * time.Second)
	/*
		We sleep this method for 10 seconds to test if the method is invoked as a Goroutine correctly.
		It in fact is, as the "Deleting file from bucket: " is printed in the console at the same time for all object keys.
		This means that the outer for loop from EmptyBucket() method is not waiting for the response from this method.
		It's invoking the helper with all elements in the loop and then it's waiting for the response from the helper.

		We are currently not handling errors here, Goroutines need to be used in Channels to catch all responses/errors.
		See this: https://stackoverflow.com/questions/20945069/catching-return-values-from-goroutines
		Also this: https://www.atatus.com/blog/goroutines-error-handling/
	*/

	deletedObject, err := project.DeleteObject(ctx, bucketName, objectKey)

	if deletedObject == nil {
		return fmt.Errorf("object not found")
	} else if err != nil {
		return fmt.Errorf("could not delete object: %v", err)
	} else {
		fmt.Println("Deleted object: ", deletedObject)
		return nil
	}
}

func EmptyBucket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Empty Bucket for Renter Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	r.ParseForm()
	bucketIdString := r.Form.Get("bucketId")
	bucketIdObjectId, err := primitive.ObjectIDFromHex(bucketIdString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing to ObjectID: " + err.Error()))
		return
	}

	renterCollection := config.GetCollection(config.DB, "renters")
	bucketCollection := config.GetCollection(config.DB, "buckets")

	bucket := models.Bucket{}

	bucketFilter := bson.D{{Key: "_id", Value: bucketIdObjectId}}
	bucketObject := bucketCollection.FindOne(context.TODO(), bucketFilter)
	err = bucketObject.Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Bucket fetching from MongoDB failed: " + err.Error()))
		return
	}

	bucketName := bucket.BucketName
	bucketSize := bucket.TotalStorageUsed
	renterId := bucket.RenterId
	totalFilesInBucket := len(bucket.Files)
	filesInsideBucket := bucket.Files
	bucketFilesUpdateFilter := bson.D{{Key: "_id", Value: bucketIdObjectId}}
	bucketFilesUpdateQuery := bson.M{"$set": bson.M{"files": []models.File{}}}

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	transactionOptions := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	session, err := config.DB.StartSession()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error creating a transaction session: " + err.Error()))
		return
	}

	defer session.EndSession(context.TODO())

	// Transaction
	callback := func(sessionContext mongo.SessionContext) (interface{}, error) {
		// Set files to [] in bucket document
		bucketDocumentUpdateResult, err := bucketCollection.UpdateOne(sessionContext, bucketFilesUpdateFilter, bucketFilesUpdateQuery)
		if err != nil {
			return nil, fmt.Errorf("error removing files from bucket document: %v", err)
		}
		fmt.Println("Deleted files inside bucket document, successful modified count: ", bucketDocumentUpdateResult)

		// Access to storj
		access, err := utils.GetStorjAccess()
		if err != nil {
			return nil, fmt.Errorf("access to uplink failed: %v", err)
		}

		// Delete files from Storj
		for i := 0; i < totalFilesInBucket; i++ {
			// Invoke Goroutine for each file inside bucket to introduce concurrency in the deletion process.
			go emptyBucketStorjHelper(sessionContext, access, bucketName, filesInsideBucket[i].Name)

			// FIXME: Uncomment this and use it if the goroutine errors can not be handled.
			// err = emptyBucketStorjHelper(sessionContext, access, bucketName, filesInsideBucket[i].Name)
			// if err != nil {
			// 	return nil, fmt.Errorf("error deleting file from storj: %v", err)
			// }
		}

		renterDocumentUpdateResult, err := renterCollection.UpdateOne(
			sessionContext,
			bson.M{"_id": renterId},
			bson.M{"$inc": bson.M{"totalNumberOfFiles": -totalFilesInBucket, "totalStorageUsed": -bucketSize}},
		)
		if err != nil {
			return nil, fmt.Errorf("error reducing bucket and file count from renter document: %v", err)
		}
		fmt.Println("Reduced bucket and file count from renter document, successful modified count: ", renterDocumentUpdateResult)

		return nil, nil
	}

	_, err = session.WithTransaction(context.Background(), callback, transactionOptions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error in transaction: " + err.Error()))
		return
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Bucket emptied successfully"))
		return
	}
}

func deleteBucketStorjHelper(ctx context.Context, access *uplink.Access, bucketName string) error {

	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	deletedObject, err := project.DeleteBucketWithObjects(ctx, bucketName)

	if err != nil {
		return fmt.Errorf("could not delete object: %v", err)
	} else {
		fmt.Println("Deleted object: ", deletedObject)
		return nil
	}
}

func DeleteBucket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Delete Bucket for Renter Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	r.ParseForm()
	bucketIdString := r.Form.Get("bucketId")
	bucketIdObjectId, err := primitive.ObjectIDFromHex(bucketIdString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing to ObjectID: " + err.Error()))
		return
	}

	renterCollection := config.GetCollection(config.DB, "renters")
	bucketCollection := config.GetCollection(config.DB, "buckets")
	bucket := models.Bucket{}
	bucketFilter := bson.D{{Key: "_id", Value: bucketIdObjectId}}
	bucketObject := bucketCollection.FindOne(context.TODO(), bucketFilter)

	err = bucketObject.Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Bucket fetching from MongoDB failed: " + err.Error()))
		return
	}

	bucketName := bucket.BucketName
	bucketSize := bucket.TotalStorageUsed
	renterId := bucket.RenterId
	totalFilesInBucket := len(bucket.Files)
	bucketDeleteFilter := bson.D{{Key: "_id", Value: bucketIdObjectId}}

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	transactionOptions := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	session, err := config.DB.StartSession()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error creating a transaction session: " + err.Error()))
		return
	}

	defer session.EndSession(context.TODO())

	// Transaction
	callback := func(sessionContext mongo.SessionContext) (interface{}, error) {
		bucketDocumentDeleteResult, err := bucketCollection.DeleteOne(sessionContext, bucketDeleteFilter)
		if err != nil {
			return nil, fmt.Errorf("error deleting bucket document: %v", err)
		}
		fmt.Println("Deleted bucket document, successful modified count: ", bucketDocumentDeleteResult)

		// Access to storj
		access, err := utils.GetStorjAccess()
		if err != nil {
			return nil, fmt.Errorf("access to uplink failed: %v", err)
		}

		// Delete bucket from Storj
		err = deleteBucketStorjHelper(sessionContext, access, bucketName)
		if err != nil {
			return nil, fmt.Errorf("error deleting file from storj: %v", err)
		}

		// Remove bucketId from renter's buckets array
		renterDocumentUpdate1Result, err := renterCollection.UpdateByID(sessionContext, renterId, bson.M{"$pull": bson.M{"buckets": bucketIdObjectId}})
		if err != nil {
			return nil, fmt.Errorf("error removing bucket from renter document: %v", err)
		}
		fmt.Println("Removed bucket from renter document, successful modified count: ", renterDocumentUpdate1Result)

		// Reduce total bucket and file count from renter document
		renterDocumentUpdate2Result, err := renterCollection.UpdateOne(
			sessionContext,
			bson.M{"_id": renterId},
			bson.M{"$inc": bson.M{"totalBuckets": -1, "totalNumberOfFiles": -totalFilesInBucket, "totalStorageUsed": -bucketSize}},
		)
		if err != nil {
			return nil, fmt.Errorf("error reducing bucket and file count from renter document: %v", err)
		}
		fmt.Println("Reduced bucket and file count from renter document, successful modified count: ", renterDocumentUpdate2Result)

		return nil, nil
	}

	_, err = session.WithTransaction(context.Background(), callback, transactionOptions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error in transaction: " + err.Error()))
		return
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Bucket emptied & deleted successfully"))
		return
	}
}
