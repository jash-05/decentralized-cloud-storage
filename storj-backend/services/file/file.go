package file

import (
	"bytes"
	"context"
	"example/backend/utils"
	"fmt"
	"io"
	"net/http"
	"os"

	"storj.io/uplink"
)

// file upload
// file upload storj helper

func uploadFileStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string, data []byte) error {

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

	// Intitiate the upload of our Object to the specified bucket and key.
	upload, err := project.UploadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return fmt.Errorf("could not initiate upload: %v", err)
	}

	// Copy the data to the upload.
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
	fmt.Println(upload.Info())
	return nil
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Upload Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	// Parse our multipart form, 10 << 20 specifies a maximum
	// upload of 10 MB files.
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("myFile")
	if err != nil {
		fmt.Println("Error retrieving the file: ", err)
		return
	}

	defer file.Close()

	fileName := header.Filename
	fmt.Println("Uploaded file name: ", fileName)

	// // Parses the request body
	// r.ParseForm()
	// bucketName will be "" if parameter is not set
	bucketName := r.Form.Get("bucketName")

	// read all of the contents of our uploaded file into a byte array
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed"))
	}

	err = uploadFileStorjHelper(context.Background(), access, bucketName, fileName, fileBytes)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj upload failed"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Uploaded successfully"))
}

// file download
// file download storj helper
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

	// Initiate a download of the object
	download, err := project.DownloadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return fmt.Errorf("could not open object: %v", err)
	}
	defer download.Close()

	// Read everything from the download stream
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
	fmt.Printf("wrote %d bytes\n", numberOfBytesWritten)
	return err
}

func DownloadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Download Endpoint Hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed"))
	}

	// Parses the request body
	r.ParseForm()

	// fileName will be "" if parameter is not set
	fileName := r.Form.Get("fileName")
	bucketName := r.Form.Get("bucketName")

	// later we will read bucketName from the r.Form as well

	err = downloadFileStorjHelper(context.Background(), access, bucketName, fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj download failed"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Downloaded successfully"))
}

// file list for a renter's bucket

// file delete
