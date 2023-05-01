import axios from 'axios'
import info from '../../config.json'

const apiEndpoint = info.storjBackend + '/storj/bucket/'

export async function getBucketsforRenter(renterId) {
    const { data } = await axios.get(apiEndpoint + `getBucketsForRenter`, { params: { renterId: renterId } })
    console.log("here", data)
    return data
}

export async function createBucket(renterId, bucketName) {
    const { data } = await axios.post(apiEndpoint + `createBucket/${renterId}`, { bucketName })
    return data
}