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

const Buckets = () => {

    //Modal states and functions for new bucket
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const [bucketName, setBucketName] = useState('')
    const [network, setNetwork] = useState('StorJ')

    const handleBucketNameChange = (e) => {
        console.log(e.target.value)
        // setBucketName(e.target.value)
    }
    const handleNetworkChange = (e) => {
        console.log(e.target.value)
        setNetwork(e.target.value)
    }
    const handleCreateNewBucket = () => {
        console.log("Creating new bucket", bucketName, network)
    }


    const handleSearchNameChange = (e) => {
        console.log(e.target.value)
    }


    const [bucketsData, setBucketsData] = useState([
        {
            id: "5f9f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
            name: "testbucket",
            network: "storj",
            created: "2021-10-05T15:00:00.000Z",
            objects: 2
        },
        {
            id: "4f8f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
            name: "testbucket2",
            network: "storj",
            created: "2021-10-05T15:00:00.000Z",
            objects: 41
        },
        {
            id: "3f7f1b0b-1b1a-4b1a-9c1a-1b1a4b1a9c1a",
            name: "testbucket3",
            network: "ipfs",
            created: "2021-10-05T15:00:00.000Z",
            objects: 20
        }
    ])


    const [loading, setLoading] = useState(true)

    const fetchBucketsforRenter = async () => {
        const id = getCurrentUser()
        //Call API from StorJ
        //Call API from Web3

        const { data } = await getBucketsforRenter()
        console.log(data)

    }

    useEffect(() => {
        fetchBucketsforRenter()
    }, [])

    return (
        <div className="buckets-wrapper">
            <BasicModal open={open} handleClose={handleClose} handleOpen={handleOpen} handleNameChange={handleBucketNameChange} handleCreateNewBucket={handleCreateNewBucket} handleNetworkChange={handleNetworkChange} network />

            <div className='buckets-header'>
                <h1>Buckets</h1>
                <Button type="Button" text="Create bucket" style={{ fontSize: "14px", backgroundColor: "#FF9F46" }} onClick={handleOpen}></Button>
            </div>
            <div className='buckets-header'>
                <InputField placeholder="Type bucket name" handleNameChange={handleSearchNameChange} />
                <div></div>
            </div>
            <br />
            <div className='buckets-list-wrapper'>
                {/* <DataTable data={bucketsData} /> */}
                <table align='left' className="table-wrapper">

                    <ListGroup>
                        <ListGroupItem>
                            <thead>
                                <tr>

                                    <th>Name</th>
                                    <th>Network</th>
                                    <th>Created</th>
                                    <th>Objects</th>
                                </tr>
                            </thead>


                        </ListGroupItem>
                        {bucketsData.map((bucket) => {
                            return (
                                <tr>
                                    <ListGroupItem href="#" active>
                                        <td>{bucket.name} </td>
                                        <td>{bucket.network} </td>
                                        <td>{bucket.created} </td>
                                        <td>{bucket.objects} </td>
                                    </ListGroupItem>
                                </tr>)
                        })
                        }

                    </ListGroup>;
                </table>

                {/* <ListGroupItem href="#" active>
                         Link1
                     </ListGroupItem>
                     <ListGroupItem href="#">Link 2</ListGroupItem>
                     <ListGroupItem href="#" disabled>
                         Link 3
                     </ListGroupItem> */}
            </div>
        </div >
    )
}

export default Buckets