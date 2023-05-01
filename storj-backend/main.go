package main

import (
	"context"
	"example/backend/db/config"
	"example/backend/services/bucket"
	"example/backend/services/file"
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Server started on port 8080")

	http.HandleFunc("/storj/file/uploadFile", file.UploadFile)
	http.HandleFunc("/storj/file/downloadFile", file.DownloadFile)
	http.HandleFunc("/storj/file/deleteFile", file.DeleteFile)
	http.HandleFunc("/storj/bucket/create", bucket.CreateBucket)
	http.HandleFunc("/storj/bucket/getBucketsForRenter", bucket.GetBucketsForRenter)
	http.HandleFunc("/storj/bucket/getFiles", bucket.GetFilesForBucket)
	http.HandleFunc("/storj/bucket/emptyBucket", bucket.EmptyBucket)
	http.HandleFunc("/storj/bucket/delete", bucket.DeleteBucket)

	err := config.DB.Ping(context.TODO(), nil)
	if err != nil {
		fmt.Println("Error pinging to MongoDB: ", err)
		panic(err)
	}

	http.ListenAndServe(":8080", nil)
}
