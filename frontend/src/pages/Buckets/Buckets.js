import { Breadcrumbs } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getCurrentUser } from '../../services/renter'
import { getBucketsforRenter } from '../../services/Storj/bucket'

const Buckets = () => {

    const [bucketsData, setBucketsData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchBucketsforRenter = async () => {
        const id = getCurrentUser()
        const { data } = await getBucketsforRenter()
        console.log(data)

    }
    useEffect(() => {
        fetchBucketsforRenter()
    }, [])

    return (
        <div className="buckets-wrapper">

        </div>
    )
}

export default Buckets