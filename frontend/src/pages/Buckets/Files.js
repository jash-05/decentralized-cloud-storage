import React, { useEffect, useState } from 'react'
import BasicTable from '../../components/BasicTable';
import axios from 'axios';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';
import AlertDialogSlide from '../../components/SlideAlertDialog';
import { simpleToast } from '../../services/utils';
import { Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

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
    const [files, setFiles] = useState(null);
    const location = useLocation();
    const [data, setData] = useState([])
    const bucketData = location.state?.payload;

    const handleFileChange = (e) => {
        console.log(e.target.files);
        // let myFiles = Object.values(e.target.files)
        // console.log("myFiles:  ", typeof (myFiles), myFiles);

        setFiles(e.target.files);
        if (e.target.files.length > 0) {
            handleClickOpen();
        }
    };

    const handleFileUpload = async (event) => {
        event.preventDefault()
        const formData = new FormData();
        for (const [key, value] of Object.entries(files)) {
            formData.append("myFiles", value);
        }
        formData.append("bucketId", bucketData?.ID);
        console.log("formData", formData)
        console.log("myFiles: ", files)
        console.log("bucketId", bucketData?.ID)
        simpleToast("Uploading File", "loading")
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

    const handleDownloadFile = async (fileName, bucketName = bucketData?.BucketName) => {
        console.log("file to download", fileName)
        console.log("bucketName", bucketData?.bucketName)
        simpleToast("Downloading File", "loading", 2000)
        try {

            const res = await axios.get("http://localhost:8080/storj/file/downloadFile", { params: { fileName: fileName, bucketName: bucketName } })
            console.log(res)
            simpleToast("File Downloaded Successfully", "success")
        }
        catch (error) {
            console.log(error);
            simpleToast("File Download Failed", "error")
        }
    }

    const handleDeleteFile = async (fileId, bucketId = bucketData?.ID) => {
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

        const res = await axios.get("http://localhost:8080/storj/bucket/getFilesForBucket", { params: { bucketId: bucketData?.ID } })
        console.log("Bucket Data:", bucketData)
        setData(res.data)
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
                <BasicTable page="file" headers={["Name", "Size (in GB)", "Type"]} rowData={data} handleDownloadFile={handleDownloadFile} handleDeleteFile={handleDeleteFile}
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