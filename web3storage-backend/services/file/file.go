package file

import (
	"context"
	"example/web3/constants"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/web3-storage/go-w3s-client"
)

func UploadFiletoNetwork(w http.ResponseWriter, r *http.Request) {

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

	access, err := w3s.NewClient(w3s.WithToken(constants.WEB3_TOKEN))
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
