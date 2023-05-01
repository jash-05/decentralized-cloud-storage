import React, { useEffect, useState } from 'react'
import BasicTable from '../../components/BasicTable';
import axios from 'axios';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';
import AlertDialogSlide from '../../components/SlideAlertDialog';
import { makeAxiosRequest, simpleToast } from '../../services/utils';
import { Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { BACKEND_NAMES, BASE_IPFS_FILE_URL, HTTP_METHODS, ROUTE_GROUPS, ROUTE_PATHS } from '../../constants/constants';

const Files = () => {

    //modal states and function for upload confirmation
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const [backdropOpen, setBackdropOpen] = React.useState(false);
    // const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState();
    const location = useLocation();
    const [data, setData] = useState([])
    const bucketData = location.state?.payload;

    const handleFileChange = (e) => {
        console.log(e.target.files);
        setFiles(e.target.files);
        if (e.target.files.length > 0) {
            handleClickOpen();
        }
    };

    const handleFileUpload = async (event) => {

        const files_array = Object.values(files);

        console.log(files);
        event.preventDefault()
        const formData = new FormData();
        formData.append("myFiles", files_array);
        formData.append("bucketId", bucketData?.ID);
        console.log("formData", formData)
        console.log("myFiles", files_array)
        console.log("bucketId", bucketData?.ID)
        // simpleToast("Uploading File", "loading")
        setOpen(false);
        setBackdropOpen(true)


        try {
            // const response = await axios.post("http://localhost:8080/storj/file/uploadFile", formData, { options })
            const response = await axios({
                method: "post",
                url: "http://localhost:8080/storj/file/uploadFile",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("File Uploaded:", response.data);
            if (response.data) {
                setBackdropOpen(false)
            }
            simpleToast("File Uploaded Successfully", "success")
            getFiles();
        } catch (error) {
            console.log(error)
            simpleToast("File Upload Failed", "error")
        }

    };

    const handleDownloadFileWeb3 = async (cid, fileName, bucketName) => {
        console.log("file cid: ", cid)
        console.log("file to download", fileName)
        console.log("bucketName", bucketName)
        const fileUrl = `${BASE_IPFS_FILE_URL}/${cid}/${fileName}`

        fetch(fileUrl)
			.then(response => {
				response.blob().then(blob => {
					let url = window.URL.createObjectURL(blob);
					let a = document.createElement('a');
					a.href = url;
					a.download = fileName;
					a.click();
				});
				// window.location.href = response.url;
		});
    }

    const handleDownloadFile = async (storageBackend, cid, fileName, bucketName = bucketData?.BucketName) => {
        if (storageBackend === "web3") {
            handleDownloadFileWeb3(cid, fileName, bucketName)
        } else {
            console.log("file to download", fileName)
            console.log("bucketName", bucketData?.bucketName)
            simpleToast("Downloading File", "loading", 2000)
            try {
    
                // const res = await axios.get("http://localhost:8080/storj/file/downloadFile", { params: { fileName: fileName, bucketName: bucketName } })
                // res.data().then(blob => {
                axios({
                    url: `http://localhost:8080/storj/file/downloadFile`,
                    method: "GET",
                    // headers: headers,
                    params: { fileName: fileName, bucketName: bucketName },
                    responseType: "blob" // important
                }).
                    then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.click();
                    })
                // });
    
                simpleToast("File Downloaded Successfully", "success")
            }
            catch (error) {
                console.log(error);
                simpleToast("File Download Failed", "error")
            }
        }
    }

    const handleDeleteFile = async (storageBackend, fileId, bucketId = bucketData?.ID) => {
        if (storageBackend === "web3") {
            const params = {fileId, bucketId}
            const res = await makeAxiosRequest(HTTP_METHODS.DELETE, BACKEND_NAMES.WEB3, ROUTE_GROUPS.FILE, ROUTE_PATHS.DELETE_FILE, null, params)
            console.log(res)
            getFiles()
        } else {
            console.log("file to delete", fileId)
            console.log("bucketId", bucketData?.ID)
            simpleToast("Deleting File", "loading", 1000)
            try {
    
                const res = await axios.delete("http://localhost:8080/storj/file/deleteFile", { params: { fileId: fileId, bucketId: bucketId } })
                console.log("Deleted File:", res.data)
                simpleToast("File Deleted Successfully", "success")
                getFiles();
            }
            catch (error) {
                console.log(error);
                simpleToast("File Deletion Failed", "error")
            }
            getFiles();
        }
    }

    // const options = [
    //     {
    //         id: 1,
    //         name: "Download",
    //         handler: handleDownloadFile
    //     },
    //     {
    //         id: 2,
    //         name: "Delete",
    //         handler: handleDeleteFile
    //     }
    // ]

    const getFiles = async () => {
        console.log("Bucket Data:", bucketData)
        const res = await makeAxiosRequest(HTTP_METHODS.GET, (bucketData.StorageBackend === "web3" ? BACKEND_NAMES.WEB3 : BACKEND_NAMES.STORJ), ROUTE_GROUPS.BUCKET, ROUTE_PATHS.GET_FILES, null, { bucketId: bucketData?.ID })
        console.log(res)
        setData(res.files)
        // const res = await axios.get("http://localhost:8080/storj/bucket/getFilesForBucket", { params: { bucketId: bucketData?.ID } })
        // console.log("Bucket Data:", bucketData)
        // setData(res.data)
    }
    useEffect(() => {
        getFiles();
    }, [bucketData])

    return (
        <div className="files-wrapper">
            <AlertDialogSlide open={open} handleClose={handleClose} handleFileUpload={handleFileUpload} fileList={files} />
            <div className='files-header'>
                <h1>{bucketData?.BucketNameAlias}</h1>
                <div>
                    <label for="fileUpload" style={{
                        backgroundColor:
                            "#70A1EB", marginRight: "10px",
                    }} className="button">
                        Upload Files
                        <input
                            style={{ display: "none" }}
                            type="file"
                            id="fileUpload"
                            name="filename"
                            onChange={handleFileChange}
                            multiple
                        />
                    </label>
                    {/* <Button type="submit" text={"Upload"} style={{ backgroundColor: "Orange" }} onClick={handleClickOpen}></Button> */}
                </div>
            </div>
            <br />
            <div className='buckets-list-wrapper'>
                <BasicTable page="file" headers={["Name", "Size (in GB)", "Type"]} rowData={data} handleDownloadFile={handleDownloadFile} handleDeleteFile={handleDeleteFile} storageBackend={bucketData?.StorageBackend}
                />
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10 }}
                open={backdropOpen}
            // onClick={handleClose}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        </div >
    )
}

export default Files