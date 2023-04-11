import React, { useEffect, useState } from 'react'
import BasicTable from '../../components/BasicTable';
import axios from 'axios';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';

const Files = () => {
    const [file, setFile] = useState();
    const location = useLocation();
    const [data, setData] = useState([])
    const bucketData = location.state?.payload;
    console.log("asdadasd", bucketData);

    const handleFileChange = (e) => {
        console.log(e.target.files);
        // setFile(e.target.files[0]);
    };




    const handleFileUpload = async (event) => {

        console.log(file);
        event.preventDefault()
        const formData = new FormData();
        formData.append("myFile", file);
        try {
            const response = await axios({
                method: "post",
                url: "http://localhost:8080/storj/file/uploadFile",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
        } catch (error) {
            console.log(error)
        }
    };

    const handleDownloadFile = async (fileName, bucketName = bucketData?.BucketName) => {
        console.log("file downloaded", fileName)
        console.log("bucketName", bucketData?.bucketName)
        const res = await axios("http://localhost:8080/storj/file/downloadFile", { params: { fileName: fileName, bucketName: bucketName } })
    }

    const options = [
        {
            id: 1,
            name: "Download",
            handler: handleDownloadFile
        }
    ]
    const getFiles = async () => {
        const res = await axios.get("http://localhost:8080/storj/bucket/getFilesForBucket", { params: { bucketId: bucketData?.ID } })
        console.log("Bucket Data:", res.data)
        setData(res.data)
    }
    useEffect(() => {
        getFiles();
    }, [bucketData])

    return (
        <div className="files-wrapper">
            {/* <BasicModal open={open} handleClose={handleClose} handleOpen={handleOpen} handleNameChange={handleBucketNameChange} handleCreateNewBucket={handleCreateNewBucket} handleNetworkChange={handleNetworkChange} network /> */}

            <div className='files-header'>
                <h1>Files</h1>
                {/* <Button type="Button" text="Upload File(s)" style={{ fontSize: "14px", backgroundColor: "#FF9F46" }} onClick={handleOpen}></Button> */}
                {/* </div>  */}
                {/* <div className='files-header'> */}
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
                    <Button type="submit" text={"Upload"} style={{ backgroundColor: "Orange" }} onClick={handleFileUpload}></Button>
                </div>
            </div>
            <br />
            <div className='buckets-list-wrapper'>
                <BasicTable page="file" headers={["Name", "Size (in GB)", "Type"]} rowData={data} options={options} />
            </div>
        </div >
    )
}

export default Files