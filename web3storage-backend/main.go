package main

import (
	"context"
	"example/web3/constants"
	"example/web3/db/config"
	"example/web3/db/models"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ipfs/go-cid"
	"github.com/web3-storage/go-w3s-client"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
)

const (
	mytoken        = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRmRTRDNzlFMDE4N0FGZTUwYzc4NThGMDA4Qjg1NjRBQjgyQTAyQWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzcwMTk3NDQ0MDEsIm5hbWUiOiJ0b2tlbjEifQ.fwZ32m9DWpMhZlxw810lVWj3XMRjBVr2LxYHZSxFF2g"
	uploadFilePath = "files/go-api-sample.png"
)

func uploadFile(ctx context.Context, c w3s.Client) string {
	f, err := os.Open(uploadFilePath)
	if err != nil {
		panic(err)
	}

	cid, err := c.Put(ctx, f)

	if err != nil {
		panic(err)
	}

	fmt.Printf("File upload successfull with cid %s\n", cid)
	stringCid := fmt.Sprint(cid)
	return stringCid
}

func getFiles(ctx context.Context, c w3s.Client, stringCid string) []string {
	cid, _ := cid.Parse(stringCid)

	res, err := c.Get(ctx, cid)
	if err != nil {
		panic(err)
	}

	f, fsys, err := res.Files()
	if err != nil {
		panic(err)
	}

	info, err := f.Stat()
	if err != nil {
		panic(err)
	}

	fileUrlsForCid := make([]string, 0)
	baseUrl := fmt.Sprintf("https://ipfs.io/ipfs/%s", stringCid)

	if info.IsDir() {
		err = fs.WalkDir(fsys, "/", func(path string, d fs.DirEntry, err error) error {
			info, _ := d.Info()
			fmt.Printf("%s (%d bytes)\n", path, info.Size())

			if path != "/" {
				fileUrl := fmt.Sprintf("%s%s", baseUrl, path)
				fmt.Println(fileUrl)
				fileUrlsForCid = append(fileUrlsForCid, fileUrl)
			}
			return err
		})
		if err != nil {
			panic(err)
		}
	} else {
		fmt.Printf("%s (%d bytes)\n", cid.String(), info.Size())
	}
	return fileUrlsForCid
}

func uploadFiletoNetwork(w http.ResponseWriter, r *http.Request) {

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

	access, err := w3s.NewClient(w3s.WithToken(mytoken))
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

}

func setupRoutes() {
	http.HandleFunc("/upload", uploadFiletoNetwork)
	http.ListenAndServe(":8087", nil)
}

func createBucket(c *gin.Context) {

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
		ID:             primitive.NewObjectID(),
		BucketName:     newBucket.BucketName,
		RenterId:       primitiveRenterId,
		CreationTime:   time.Now(),
		StorageBackend: constants.BACKEND,
		Files:          make([]models.File, 0),
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

func main() {

	// setupRoutes()

	router := gin.Default()
	router.POST("/renter/bucket/create", createBucket)
	router.Run("localhost:8080")

	// c, err := w3s.NewClient(w3s.WithToken(mytoken))
	// if err != nil {
	// 	panic(err)
	// }

	// ctx := context.Background()

	// // Upload File
	// uploadedCid := uploadFile(ctx, c)
	// fmt.Printf("Uploaded CID = %s\n", uploadedCid)

	// // Download file
	// // uploadedCid := "bafybeieawnqabjulxna3dcyeu3ugqori5dy3sykr6emv6zrtse3eyyshde"
	// fileUrlsForCid := getFiles(ctx, c, uploadedCid)
	// fmt.Printf("The locations of files are: %v\n", fileUrlsForCid)
}

//
