package file

import (
	"context"
	"example/web3/constants"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"time"

	"example.com/mainbackend/db/config"
	"example.com/mainbackend/db/models"
	"github.com/gin-gonic/gin"
	"github.com/web3-storage/go-w3s-client"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UploadFiletoNetwork(c *gin.Context) {

	var r *http.Request = c.Request
	var w http.ResponseWriter = c.Writer

	fmt.Println("Upload File to web3storage")
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("myFile")
	if err != nil {
		fmt.Println("Error retrieving file", err)
		return
	}

	defer file.Close()

	fmt.Println("Uploading File : ", header.Filename)

	var filename string = header.Filename

	access, err := w3s.NewClient(w3s.WithToken(constants.WEB3_TOKEN))
	if err != nil {
		fmt.Println("Failed to gain access to web3storage client")
	}

	ctx := context.Background()

	fileBytes, err := io.ReadAll(file)
	f, err := os.Create(filename)
	byteswritten, err := f.Write(fileBytes)
	fmt.Println("Bytes written : ", byteswritten)

	cid, err := access.Put(ctx, f)
	if err != nil {
		fmt.Println("Could not upload file", filename, err)
	}

	fmt.Printf("File upload successfull with cid %s", cid)

	//Updating Mongo DB by removing files from Renters
	bucketId, _ := primitive.ObjectIDFromHex(r.Form.Get("bucketId"))
	bucket := models.Bucket{}

	bucketFilter := bson.D{{Key: "_id", Value: bucketId}}

	bucketCollection := config.GetCollection(config.DB, "buckets")
	renterCollection := config.GetCollection(config.DB, "renters")

	bucketObject := bucketCollection.FindOne(context.TODO(), bucketFilter)
	err = bucketObject.Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Bucket fetching from MongoDB failed: " + err.Error()))
	}

	fmt.Println("Bucket name: ", bucket.BucketName)
	fmt.Println("Renter ID: ", bucket.RenterId)
	fileName := header.Filename


	newFile := models.File{
		ID:             primitive.NewObjectID(),
		Name:           fileName,
		SizeInGB:       float64(header.Size) * 9.31 * math.Pow(10, -10),
		UploadDateTime: time.Now(),
		Type:           header.Header.Get("Content-Type"),
	}

	bucketDocumentUpdateResult, err := bucketCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": bucketId},
		bson.M{"$push": bson.M{"files": newFile}},
	)
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([] byte("File info upload to mongo failed : " + err.Error()))
	} else {
		fmt.Println("File info upload to MongoDB successful modified count: ", bucketDocumentUpdateResult.ModifiedCount)
	}
	
	renterDocumentUpdateResult, err := renterCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": bucket.RenterId},
		bson.M{"$inc": bson.M{"totalStorage": newFile.SizeInGB, "totalNumberOfFiles": 1}},
	)

	if err!=nil{
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File info upload to MongoDB failed 2: " + err.Error()))
	} else{
		fmt.Println("File info upload to MongoDB renter collection successful modified count: ", renterDocumentUpdateResult.ModifiedCount)
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Uploaded successfully"))
}

func DeleteFile(c *gin.Context) {
	var r *http.Request = c.Request
	var w http.ResponseWriter = c.Writer

	r.ParseMultipartForm(10 << 20)
	
	bucketId, _ := primitive.ObjectIDFromHex(r.Form.Get("bucketId"))
	fileId, _ := primitive.ObjectIDFromHex(r.Form.Get("fileId"))

	bucket := models.Bucket{}
	file := models.File{}

	bucketFilter := bson.D{{Key: "_id", Value: bucketId}}

	fmt.Println("Bucket ID: ", bucketId)

	bucketCollection := config.GetCollection(config.DB, "buckets")
	renterCollection := config.GetCollection(config.DB, "renters")

	bucketObject := bucketCollection.FindOne(context.TODO(), bucketFilter)
	err := bucketObject.Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error while fetching bucket" + err.Error()))
		return
	} else {
		fmt.Println("Bucket fetched, Bucket name: ", bucket.BucketName)
	}
	
	bucketDocumentUpdateResult, err := bucketCollection.UpdateByID(context.TODO(), bucketId, bson.M{"$pull": bson.M{"files": bson.M{"_id": fileId}}})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("File info upload to MongoDB failed 1: " + err.Error()))
			return
		} else {
			fmt.Println("File info update in MongoDB bucket collection successful modified count: ", bucketDocumentUpdateResult.ModifiedCount)
		}

		renterDocumentUpdateResult, err := renterCollection.UpdateOne(
			context.TODO(),
			bson.M{"_id": bucket.RenterId},
			bson.M{"$inc": bson.M{"totalStorage": -file.SizeInGB, "totalNumberOfFiles": -1}},
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("File info upload to MongoDB failed 2: " + err.Error()))
			return
		} else {
			fmt.Println("File info update in MongoDB renter collection successful modified count: ", renterDocumentUpdateResult.ModifiedCount)
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Deleted successfully"))

}

