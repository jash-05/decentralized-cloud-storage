import { Breadcrumbs } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { getCurrentUser } from '../../services/renter'
import { getBucketsforRenter } from '../../services/Storj/bucket'
import '../../styles/Buckets.css'
import InputField from '../../components/InputField'
import DataTable from '../../components/DataTable'
import { Container } from '@mui/system'
import BasicModal from '../../components/BasicModal'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import BasicTable from '../../components/BasicTable'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import axios from 'axios'
import { makeAxiosRequest, simpleToast } from '../../services/utils'
import { BACKEND_NAMES, HTTP_METHODS, ROUTE_GROUPS, ROUTE_PATHS } from '../../constants/constants'


const Buckets = () => {

    //Modal states and functions for new bucket
    // const [renterId, setRenterId] = useState('')
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const CustomIconStyle = { height: "100%", verticalAlign: "-30%", marginRight: "5%" }

    const renterId = getCurrentUser()
    // const renterId = localStorage.getItem("renterId")
    const [bucketName, setBucketName] = useState('')
    const [network, setNetwork] = useState('storj')

    const handleBucketNameChange = (e) => {
        console.log(e.target.value)
        setBucketName(e.target.value)
    }
    const handleNetworkChange = (event, selected) => {
        console.log(selected)
        setNetwork(selected)
    }

    const handleCreateNewBucket = async (event) => {
        event.preventDefault()
        console.log("Creating new bucket", bucketName, network, renterId)
        simpleToast("Creating new bucket", "loading", 1000)
        let res;
        if (network === "web3") {
            const payload = { bucketName, renterId }
            res = await makeAxiosRequest(HTTP_METHODS.POST, BACKEND_NAMES.WEB3, ROUTE_GROUPS.BUCKET, ROUTE_PATHS.CREATE_BUCKET, payload, null)
        } else {
            const params = { bucketName, renterId }
            res = await makeAxiosRequest(HTTP_METHODS.POST, BACKEND_NAMES.STORJ, ROUTE_GROUPS.BUCKET, ROUTE_PATHS.CREATE_BUCKET, null, params)
        }
        console.log("Bucket created successfully", res)
        setDataDependency(res)
        simpleToast("Bucket created successfully", "success")

        handleClose()
    }

    const handleSearchNameChange = (e) => {
        console.log(e.target.value)
    }

    const [dataDepenency, setDataDependency] = useState('')
    // const [bucketsData, setBucketsData] = useState([
    //     {
    //         id: "5f9f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
    //         name: "testbucket",
    //         network: "storj",
    //         created: "2021-10-05T15:00:00.000Z",
    //         objects: 2
    //     },
    //     {
    //         id: "4f8f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
    //         name: "testbucket2",
    //         network: "storj",
    //         created: "2021-10-05T15:00:00.000Z",
    //         objects: 41
    //     },
    //     {
    //         id: "3f7f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
    //         name: "testbucket3",
    //         network: "ipfs",
    //         created: "2021-10-05T15:00:00.000Z",
    //         objects: 20
    //     }
    // ])
    const [bucketsData, setBucketsData] = useState([])

    const handleDeleteBucket = async (bucketId, StorageBackend) => {
        console.log("Deleting bucket", bucketId, StorageBackend)
        let res;
        if (StorageBackend === "web3") {
            const params = { bucketId }
            res = await makeAxiosRequest(HTTP_METHODS.DELETE, BACKEND_NAMES.WEB3, ROUTE_GROUPS.BUCKET, ROUTE_PATHS.DELETE_BUCKET, null, params)
        } else {
            const params = { bucketId }
            res = await makeAxiosRequest(HTTP_METHODS.GET, BACKEND_NAMES.STORJ, ROUTE_GROUPS.BUCKET, ROUTE_PATHS.DELETE_BUCKET, null, params)
        }
        console.log(res)
        setDataDependency(bucketId)
        simpleToast("Bucket deleted successfully", "success")
    }

    const handleEmptyBucket = async (bucketId) => {
        console.log("Emptying bucket", bucketId)

        try {
            const res = await axios.delete(`http://localhost:8080/storj/bucket/emptyBucket`, { params: { bucketId } })
            console.log("Bucket emptied successfully", res.data)
            // setDataDependency(res.data)

        } catch (err) {
            console.error("Error occured while emptying bucket", err)
        }
        setDataDependency("reload1")

    }
    const options = [
        {
            id: 1,
            name: "Delete Bucket",
            handler: handleDeleteBucket
        },
        {
            id: 2,
            name: "Empty Bucket",
            handler: handleEmptyBucket
        }
    ]

    const [loading, setLoading] = useState(true)

    const fetchBucketsforRenter = async () => {
        
        const id = getCurrentUser()
        const data = await getBucketsforRenter(id)
        setBucketsData(data)
    }

    useEffect(() => {

        fetchBucketsforRenter()
    }, [dataDepenency])

    return (
        <div className="buckets-wrapper">
            <BasicModal open={open} handleClose={handleClose} handleOpen={handleOpen} handleNameChange={handleBucketNameChange} handleCreateNewBucket={handleCreateNewBucket} handleNetworkChange={handleNetworkChange} network={network} />

            <div className='buckets-header'>
                <h1>Buckets</h1>
                <Button icon={<AddCircleOutlineOutlinedIcon sx={CustomIconStyle} />} type="Button" text="Create Bucket" style={{ minWidth: "200px", fontSize: "20px", backgroundColor: "#FFD817" }} onClick={handleOpen}></Button>
            </div>
            <div className="bucket-search-wrapper" >
                <InputField placeholder="Type bucket name" handleNameChange={handleSearchNameChange} />

            </div>
            <br />
            <div className='buckets-list-wrapper'>
                <BasicTable page={"bucket"} headers={["Name", "Network", "Objects", "Created"]} rowData={bucketsData} handleDeleteBucket={handleDeleteBucket} handleEmptyBucket={handleEmptyBucket} options={options} />
            </div>
        </div >
    )
}

export default Buckets