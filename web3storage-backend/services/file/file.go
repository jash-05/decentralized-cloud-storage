package file

import (
	"context"
	"example/web3/constants"
	"fmt"
	"io"
	"math"
	"mime/multipart"
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

func UploadFile(c *gin.Context, filename string, file multipart.File, headerSize int, contentType string) {

	var r *http.Request = c.Request
	var w http.ResponseWriter = c.Writer

	access, err := w3s.NewClient(w3s.WithToken(constants.WEB3_TOKEN))
	if err != nil {
		fmt.Println("Failed to gain access to web3storage client")
	}

	ctx := context.Background()

	fileBytes, err := io.ReadAll(file)
	f, err := os.Create(filename)
	byteswritten, err := f.Write(fileBytes)
	fmt.Println("Bytes written : ", byteswritten)

	new_f, err := os.Open(filename)
	if err != nil {
		fmt.Println("Could not open file")
	}

	cid, err := access.Put(ctx, new_f)
	if err != nil {
		fmt.Println("Could not upload file", filename, err)
	}

	fmt.Printf("File upload successfull with cid %s\n", cid)

	defer os.Remove(filename)

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

	newFile := models.File{
		ID:             primitive.NewObjectID(),
		Name:           filename,
		SizeInGB:       float64(headerSize) * 9.31 * math.Pow(10, -10),
		UploadDateTime: time.Now(),
		Type:           contentType,
		Cid:            cid.String(),
	}

	bucketDocumentUpdateResult, err := bucketCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": bucketId},
		bson.M{"$push": bson.M{"files": newFile}},
	)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File info upload to mongo failed : " + err.Error()))
	} else {
		fmt.Println("File info upload to MongoDB successful modified count: ", bucketDocumentUpdateResult.ModifiedCount)
	}

	renterDocumentUpdateResult, err := renterCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": bucket.RenterId},
		bson.M{"$inc": bson.M{"totalStorage": newFile.SizeInGB, "totalNumberOfFiles": 1}},
	)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("File info upload to MongoDB failed 2: " + err.Error()))
	} else {
		fmt.Println("File info upload to MongoDB renter collection successful modified count: ", renterDocumentUpdateResult.ModifiedCount)
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Uploaded successfully"))

}

func UploadFiletoNetwork(c *gin.Context) {

	var r *http.Request = c.Request
	var w http.ResponseWriter = c.Writer
	fmt.Println("Upload File to web3storage")
	r.ParseMultipartForm(10 << 20)

	//Get files from request and check the count
	files := r.MultipartForm.File["myFile"]
	if len(files) > 1 {
		for _, file := range files {
			f, err := file.Open()
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				fmt.Println("Error retrieving file", err)
				return
			}
			defer f.Close()
			filename := file.Filename
			UploadFile(c, filename, f, (int(file.Size)), file.Header.Get("Content-Type"))
		}
	} else {
		file, header, err := r.FormFile("myFile")
		if err != nil {
			fmt.Println("Error retrieving file", err)
			return
		}

		defer file.Close()

		fmt.Println("Uploading File : ", header.Filename)

		var filename string = header.Filename
		UploadFile(c, filename, file, (int(header.Size)), header.Header.Get("Content-Type"))
	}

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

// func DownloadFile(c *gin.Context) {

// 	/*Steps:

// 		you will get renter, bucket name > file name > fetch the cid of this file
// 		1. get bucket name and file name
// 		2. use them to filter out the mongo collection in buckets collection
// 		3. use the cid value in under files to form a url
// 		4. url = https:// + cid+ filename

// 	*/

// 	var r *http.Request = c.Request;
// 	var w http.ResponseWriter = c.Writer
// 	r.ParseForm()

// 	bucketCollection := config.GetCollection(config.DB, "buckets")
// 	//renterCollection := config.GetCollection(config.DB, "renter")

// 	fileName := r.Form.Get("fileName")
// 	bucketName := r.Form.Get("bucketName")
// 	bucket := models.Bucket{}

// 	bucketObject := bucketCollection.FindOne(context.TODO(),bson.M{"bucketName":bucketName, "files.name":fileName})
// 	err := bucketObject.Decode(&bucket)

// 	if err != nil {
// 		w.WriteHeader(http.StatusInternalServerError)
// 		w.Write([]byte("Bucket fetching from MongoDB failed: " + err.Error()))
// 		return
// 	}
// }
