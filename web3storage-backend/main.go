package main

import (
	"context"
	bucketroutes "example/web3/routes/bucket"
	fileroutes "example/web3/routes/file"
	"fmt"

	"example.com/mainbackend/db/config"
	"github.com/gin-gonic/gin"
)

//  func getFiles(ctx context.Context, c w3s.Client, stringCid string) []string {
//  	cid, _ := cid.Parse(stringCid)

//  	res, err := c.Get(ctx, cid)
//  	if err != nil {
//  		panic(err)
//  	}

//  	f, fsys, err := res.Files()
// 	if err != nil {
// 		panic(err)
// 	}

// 	info, err := f.Stat()
// 	if err != nil {
// 		panic(err)
// 	}

// 	fileUrlsForCid := make([]string, 0)
// 	baseUrl := fmt.Sprintf("https://ipfs.io/ipfs/%s", stringCid)

// 	if info.IsDir() {
// 		err = fs.WalkDir(fsys, "/", func(path string, d fs.DirEntry, err error) error {
// 			info, _ := d.Info()
// 			fmt.Printf("%s (%d bytes)\n", path, info.Size())

// 			if path != "/" {
// 				fileUrl := fmt.Sprintf("%s%s", baseUrl, path)
// 				fmt.Println(fileUrl)
// 				fileUrlsForCid = append(fileUrlsForCid, fileUrl)
// 			}
// 			return err
// 		})
// 		if err != nil {
// 			panic(err)
// 		}
// 	} else {
// 		fmt.Printf("%s (%d bytes)\n", cid.String(), info.Size())
// 	}
// 	return fileUrlsForCid
// }

func main() {
	router := gin.Default()
	web3Routes := router.Group("web3")
	fileroutes.Routes(web3Routes)
	bucketroutes.Routes(web3Routes)
	router.Run("localhost:8082")

	err := config.DB.Ping(context.TODO(), nil)
	if err != nil {
		fmt.Println("Error pinging to MongoDB: ", err)
		panic(err)
	} else {
		fmt.Println("Pinged Mongo Successfullyy!")	
	}



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
