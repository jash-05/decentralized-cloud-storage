package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"storj.io/uplink"
)

const (
	satelliteAddress = "12EayRS2V1kEsWESU9QMRseFhdxYxKicsiFmxrsLZHeLUtdps3S@us1.storj.io:7777"
	apiKey           = "1dfHxfBQEwMbpqjE7hyKtTbykigSBkzgq7uCFr99K2YFDNvcSS9q4i5KA7QUBcs1rULjbU84496owoqNpA5yMrjLqMdG1cbRL5AbHrjor9r5Lm1hBGPU"
	rootPassphrase   = "grape grape crawl angle squirrel symbol common pair bracket citizen funny sunset"
	myBucket         = "test2"
	myObjectKey      = "Jaineil - Resume.pdf"
)

func uploadData(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string, filepath string) error {

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

	// Open the file we will be uploading.
	f, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("could not open file to upload: %v", err)
	}
	defer f.Close()

	// Intitiate the upload of our Object to the specified bucket and key.
	upload, err := project.UploadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return fmt.Errorf("could not initiate upload: %v", err)
	}

	// Copy the data to the upload.
	// buf := bytes.NewBuffer(data)
	_, err = io.Copy(upload, f)
	if err != nil {
		_ = upload.Abort()
		return fmt.Errorf("could not upload data: %v", err)
	}

	// Commit the uploaded object.
	err = upload.Commit()
	if err != nil {
		return fmt.Errorf("could not commit uploaded object: %v", err)
	}

	return nil
}

func downloadData(ctx context.Context,
	access *uplink.Access, bucketName string, objectKey string, filepath string) error {

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

	f, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("could not create file to upload: %v", err)
	}
	defer f.Close()

	w := bufio.NewWriter(f)

	object, err := project.DownloadObject(ctx, bucketName, objectKey, nil)
	if err != nil {
		return err
	}
	defer object.Close()

	_, err = io.Copy(w, object)
	return err
}

func main() {
	access, err := uplink.RequestAccessWithPassphrase(context.Background(), satelliteAddress, apiKey, rootPassphrase)
	if err != nil {
		return
	} else {
		fmt.Println("access successful!")

		err = uploadData(context.Background(),
			access, myBucket, myObjectKey, "Jaineil - Resume.pdf")
		if err != nil {
			log.Fatalln("error:", err)
		}

		fmt.Println("upload success!")

		err = downloadData(context.Background(), access, myBucket, myObjectKey, "Jaineil - Resume - 1.pdf")
		if err != nil {
			log.Fatalln("error:", err)
		}

		fmt.Println("download success!")
	}
}
