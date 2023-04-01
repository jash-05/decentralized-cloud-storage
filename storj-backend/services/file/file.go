package file

import (
	"bytes"
	"context"
	"example/backend/db/config"
	"example/backend/db/models"
	"example/backend/utils"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"storj.io/uplink"
)

func uploadFileStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string, data []byte) error {

	// Open up the project we will be working with.
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	// Ensure the desired bucket within the project is created.
	_, err = project.EnsureBucket(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("could not ensure bucket: %v", err)
	}

	// Instantiate upload object of storj with our data and specified bucket.
	upload, err := project.UploadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return fmt.Errorf("could not initiate upload: %v", err)
	}

	// Copy the data to the instantiated upload object.
	buf := bytes.NewBuffer(data)
	_, err = io.Copy(upload, buf)
	if err != nil {
		_ = upload.Abort()
		return fmt.Errorf("could not upload data: %v", err)
	}

	// Commit the uploaded object.
	err = upload.Commit()
	if err != nil {
		return fmt.Errorf("could not commit uploaded object: %v", err)
	}

	fmt.Println("Upload successful to Storj")
	return nil
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Upload Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	// Parse our multipart form.
	// 10 << 20 specifies a maximum upload of 10 MB files.
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("myFile")
	if err != nil {
		fmt.Println("Error retrieving the file: ", err)
		return
	}

	defer file.Close()

	fileName := header.Filename
	fmt.Println("Uploading file: ", fileName)

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

	// read all of the contents of our uploaded file into a byte array
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to uplink failed: " + err.Error()))
	}

	err = uploadFileStorjHelper(context.Background(), access, bucket.BucketName, fileName, fileBytes)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj upload failed: " + err.Error()))
	} else {
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
			w.Write([]byte("File info upload to MongoDB failed 1: " + err.Error()))
		} else {
			fmt.Println("File info upload to MongoDB bucket collection successful modified count: ", bucketDocumentUpdateResult.ModifiedCount)
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
}

func downloadFileStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string) error {

	// Open up the Project we will be working with.
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	// Ensure the desired Bucket within the Project is created.
	_, err = project.EnsureBucket(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("could not ensure bucket: %v", err)
	}

	// Instantiate a download stream for given bucket and object.
	download, err := project.DownloadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return fmt.Errorf("could not open object: %v", err)
	}
	defer download.Close()

	// Read everything from the download stream.
	receivedContents, err := io.ReadAll(download)
	if err != nil {
		return fmt.Errorf("could not read data: %v", err)
	}

	f, err := os.Create(objectKey)
	if err != nil {
		return fmt.Errorf("could not create file to upload: %v", err)
	}
	defer f.Close()

	numberOfBytesWritten, err := f.Write(receivedContents)
	if err != nil {
		return fmt.Errorf("could not write received data to file: %v", err)
	}

	fmt.Printf("wrote %d bytes\n", numberOfBytesWritten)
	return nil
}

func DownloadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Download Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed"))
	}

	r.ParseForm()

	fileName := r.Form.Get("fileName")
	bucketName := r.Form.Get("bucketName")

	err = downloadFileStorjHelper(context.Background(), access, bucketName, fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj download failed" + err.Error()))
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Downloaded successfully"))
	}
}

func deleteFileStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string) error {

	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	_, err = project.EnsureBucket(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("could not ensure bucket: %v", err)
	}

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

// TODO: Make the MongoDB delete transactional
func DeleteFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Delete Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed: " + err.Error()))
		return
	}

	r.ParseForm()

	fileId, _ := primitive.ObjectIDFromHex(r.Form.Get("fileId"))
	bucketId, _ := primitive.ObjectIDFromHex(r.Form.Get("bucketId"))

	bucket := models.Bucket{}
	file := models.File{}

	bucketCollection := config.GetCollection(config.DB, "buckets")
	renterCollection := config.GetCollection(config.DB, "renters")

	bucketFilter := bson.D{{Key: "_id", Value: bucketId}}
	bucketObject := bucketCollection.FindOne(context.TODO(), bucketFilter)
	err = bucketObject.Decode(&bucket)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Bucket fetching from MongoDB failed: " + err.Error()))
		return
	}

	var getFilenameFromFilesSlice = func(filesInsideBucket []models.File) string {
		var matchedFileName = ""
		for i := 0; i < len(filesInsideBucket); i++ {
			if filesInsideBucket[i].ID == fileId {
				matchedFileName := filesInsideBucket[i].Name
				return matchedFileName
			}
		}
		return matchedFileName
	}

	fmt.Println("Bucket name: ", bucket.BucketName)
	fmt.Println("Renter ID: ", bucket.RenterId)

	fileName := getFilenameFromFilesSlice(bucket.Files)
	fmt.Println("File name: ", fileName)

	err = deleteFileStorjHelper(context.Background(), access, bucket.BucketName, fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj delete failed: " + err.Error()))
		return
	} else {
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
}
