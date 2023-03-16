package main

import (
	"context"
	"fmt"
	"os"

	"github.com/web3-storage/go-w3s-client"
)

const (
	mytoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRmRTRDNzlFMDE4N0FGZTUwYzc4NThGMDA4Qjg1NjRBQjgyQTAyQWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzcwMTk3NDQ0MDEsIm5hbWUiOiJ0b2tlbjEifQ.fwZ32m9DWpMhZlxw810lVWj3XMRjBVr2LxYHZSxFF2g"
	uploadFilePath ="files/go-api-sample.png"
)

func uploadFile(ctx context.Context, c w3s.Client){
	f, err := os.Open(uploadFilePath)
	if err!=nil {
		panic(err)
	}
	
	cid, err:= c.Put(ctx, f)

	if err!= nil {
		panic(err)
	}

	fmt.Printf("File upload successfull with cid %s",  cid)

}

func main() {
	c, err := w3s.NewClient(w3s.WithToken(mytoken))
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	uploadFile(ctx, c) 
}