import React, { useEffect, useState } from 'react'
import BasicTable from '../../components/BasicTable';
import axios from 'axios';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';
import AlertDialogSlide from '../../components/SlideAlertDialog';

const Files = () => {

    //modal states and function for upload confirmation
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };




    const [file, setFile] = useState();
    const location = useLocation();
    const [data, setData] = useState([])
    const bucketData = location.state?.payload;
    // console.log("data", data);



    const handleFileChange = (e) => {
        console.log(e.target.files);
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (event) => {

        console.log(file);
        event.preventDefault()
        const formData = new FormData();
        formData.append("myFile", file);
        formData.append("bucketId", bucketData?.ID);
        console.log("formData", formData)
        console.log("myFile", file)
        console.log("bucketId", bucketData?.ID)
        try {
            const response = await axios({
                method: "post",
                url: "http://localhost:8080/storj/file/uploadFile",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("File Uploaded:", response.data);
            getFiles();
        } catch (error) {
            console.log(error)
        }
        setOpen(false);

    };

    const handleDownloadFile = async (fileName, bucketName = bucketData?.BucketName) => {
        console.log("file to download", fileName)
        console.log("bucketName", bucketData?.bucketName)
        try {

            const res = await axios.get("http://localhost:8080/storj/file/downloadFile", { params: { fileName: fileName, bucketName: bucketName } })
            console.log("Downloaded File:", res.data)
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleDeleteFile = async (fileId, bucketId = bucketData?.ID) => {
        console.log("file to delete", fileId)
        console.log("bucketId", bucketData?.ID)
        try {

            const res = await axios.delete("http://localhost:8080/storj/file/deleteFile", { params: { fileId: fileId, bucketId: bucketId } })
            console.log("Deleted File:", res.data)
            getFiles();
        }
        catch (error) {
            console.log(error);
        }
        getFiles();
    }

    const options = [
        {
            id: 1,
            name: "Download",
            handler: handleDownloadFile
        },
        {
            id: 2,
            name: "Delete",
            handler: handleDeleteFile
        }
    ]

    const getFiles = async () => {
        const res = await axios.get("http://localhost:8080/storj/bucket/getFilesForBucket", { params: { bucketId: bucketData?.ID } })
        console.log("Bucket Data:", res.data)
        setData(res.data)
    }
    useEffect(() => {
        getFiles();
    }, [])

    return (
        <div className="files-wrapper">
            <AlertDialogSlide open={open} handleClose={handleClose} handleFileUpload={handleFileUpload} fileList={file} />
            <div className='files-header'>
                <h1>Files</h1>
                <div>
                    <label for="fileUpload" style={{
                        backgroundColor:
                            "#70A1EB", marginRight: "10px"
                    }} className="button">
                        Choose Files
                        <input
                            style={{ display: "none" }}
                            type="file"
                            id="fileUpload"
                            name="filename"
                            onChange={handleFileChange}
                            multiple
                        />
                    </label>
                    <Button type="submit" text={"Upload"} style={{ backgroundColor: "Orange" }} onClick={handleClickOpen}></Button>
                </div>
            </div>
            <br />
            <div className='buckets-list-wrapper'>
                <BasicTable page="file" headers={["Name", "Size (in GB)", "Type"]} rowData={data} handleDownloadFile={handleDownloadFile} handleDeleteFile={handleDeleteFile} options={options} />
            </div>
        </div >
    )
}

export default Files