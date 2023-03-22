package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"

	"storj.io/uplink"
)

const (
	satelliteAddress = "12EayRS2V1kEsWESU9QMRseFhdxYxKicsiFmxrsLZHeLUtdps3S@us1.storj.io:7777"
	apiKey           = "1dfHxfBQEwMbpqjE7hyKtTbykigSBkzgq7uCFr99K2YFDNvcSS9q4i5KA7QUBcs1rULjbU84496owoqNpA5yMrjLqMdG1cbRL5AbHrjor9r5Lm1hBGPU"
	rootPassphrase   = "grape grape crawl angle squirrel symbol common pair bracket citizen funny sunset"
	myBucket         = "test2"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func downloadData(ctx context.Context,
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

func uploadData(ctx context.Context,
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

func downloadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Download Endpoint Hit")

	enableCors(&w)

	access, err := uplink.RequestAccessWithPassphrase(context.Background(), satelliteAddress, apiKey, rootPassphrase)
	if err != nil {
		fmt.Println("Access to Uplink failed")
		return
	}

	// Parses the request body
	r.ParseForm()

	// fileName will be "" if parameter is not set
	fileName := r.Form.Get("fileName")

	// later we will read bucketName from the r.Form as well

	err = downloadData(context.Background(), access, myBucket, fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj download failed"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Downloaded successfully"))
}

func uploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Upload Endpoint Hit")

	enableCors(&w)

	// Parse our multipart form, 10 << 20 specifies a maximum
	// upload of 10 MB files.
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("myFile")
	if err != nil {
		fmt.Println("Error retrieving the file")
		fmt.Println(err)
		return
	}

	defer file.Close()

	fmt.Println("Uploaded file name: ", header.Filename)
	var fileName string = header.Filename

	// read all of the contents of our uploaded file into a byte array
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}

	access, err := uplink.RequestAccessWithPassphrase(context.Background(), satelliteAddress, apiKey, rootPassphrase)
	if err != nil {
		fmt.Println("Access to Uplink failed")
		return
	}

	err = uploadData(context.Background(), access, myBucket, fileName, fileBytes)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Storj upload failed"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Uploaded successfully"))
}

//--------------------------------------------

func getBuckets(w http.ResponseWriter, r *http.Request){
	fmt.Println("Get Buckets API hit")

	access, err := uplink.RequestAccessWithPassphrase(context.Background(), satelliteAddress, apiKey, rootPassphrase)
	if err != nil {
		fmt.Println("Access to Uplink failed")
		return
	}

	err = listBuckets(context.Background(), access )
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to get bucket list"))
	}

	
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Retrieved buckets successfully"))
}

func listBuckets(ctx context.Context,
	access *uplink.Access ) error {

	fmt.Println("opening project ... ")
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()

	buckets := project.ListBuckets(ctx, nil)
	for buckets.Next() {
    	fmt.Println(buckets.Item().Name)
	}

	if err := buckets.Err(); err != nil {
		return fmt.Errorf("Could not list buckets: %v", err)
	}

	fmt.Println("Buckets listed successfully")
	return nil
}

//-----------------------------------------------------------------------------

func getObjects(w http.ResponseWriter, r *http.Request){
	fmt.Println("Get Objects API hit")

	access, err := uplink.RequestAccessWithPassphrase(context.Background(), satelliteAddress, apiKey, rootPassphrase)
	if err != nil {
		fmt.Println("Access to Uplink failed")
		return
	}

	err = listObjects(context.Background(), access )
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to get objects list"))
	}

	
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Retrieved objects successfully"))
}

func listObjects(ctx context.Context,
	access *uplink.Access ) error {

	fmt.Println("opening project ... ")
	project, err := uplink.OpenProject(ctx, access)
	if err != nil {
		return fmt.Errorf("could not open project: %v", err)
	}
	defer project.Close()
	
	// Ensure the desired Bucket within the Project is created.
	_, err = project.EnsureBucket(ctx, myBucket)
	if err != nil {
		return fmt.Errorf("could not ensure bucket: %v", err)
	}
	

	objects := project.ListObjects(ctx, myBucket, nil)
	
	for objects.Next() {
    	item := objects.Item()
    	fmt.Println(item.IsPrefix, item.Key)
	}
	
	if err := objects.Err(); err != nil {
		return fmt.Errorf("Could not list objects: %v", err)
	}

	fmt.Println("Objects listed successfully")
	return nil
}



func setupRoutes() {
	http.HandleFunc("/upload", uploadFile)
	http.HandleFunc("/download", downloadFile)
	http.HandleFunc("/getBuckets", getBuckets)
	http.HandleFunc("/getObjects", getObjects)
	http.ListenAndServe(":8080", nil)
}





func main() {
	fmt.Println("Hello World")
	setupRoutes()
	// listObjects()
}
