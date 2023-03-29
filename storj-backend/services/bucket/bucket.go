package bucket

import (
	"context"
	"example/backend/utils"
	"fmt"
	"net/http"

	"storj.io/uplink"
)

func getFilesForBucketStorjHelper(ctx context.Context,
	access *uplink.Access, bucketName string) error {

	fmt.Println("opening project ... ")
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

	objects := project.ListObjects(ctx, bucketName, nil)

	for objects.Next() {
		item := objects.Item()
		fmt.Println(item.Key)
	}

	if err := objects.Err(); err != nil {
		return fmt.Errorf("could not list objects: %v", err)
	}

	fmt.Println("Objects listed successfully")
	return nil
}

func GetFilesForBucket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Get Objects API hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed"))
	}

	r.ParseForm()
	bucketName := r.Form.Get("bucketName")

	err = getFilesForBucketStorjHelper(context.Background(), access, bucketName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to get objects list"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Retrieved objects successfully"))
}

func getBucketsForRenterStorjHelper(ctx context.Context,
	access *uplink.Access) error {

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
		return fmt.Errorf("could not list buckets: %v", err)
	}

	fmt.Println("Buckets listed successfully")
	return nil
}

func GetBucketsForRenter(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Get Buckets API hit")

	(w).Header().Set("Access-Control-Allow-Origin", "*")

	access, err := utils.GetStorjAccess()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Access to Uplink failed"))
	}

	err = getBucketsForRenterStorjHelper(context.Background(), access)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to get bucket list"))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Retrieved buckets successfully"))
}
