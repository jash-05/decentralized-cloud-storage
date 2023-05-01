import axios from 'axios'
import { GET_BACKEND_URL, HTTP_METHODS } from '../constants/constants'
import toast from 'react-hot-toast';


const printErrorMessage = (err, requestUrl, method) => {
    console.log(`Error occured: ${err}`)
    console.log(`Request URL: ${requestUrl}`)
    console.log(`Method: ${method}`)
}

const makeGetRequest = async (requestUrl, payload) => {
    try {
        const { data } = await axios.get(requestUrl, payload)
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'GET')
    }
}

const makePostRequest = async (requestUrl, payload) => {
    try {
        const { data } = await axios.post(requestUrl, payload)
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'POST')
    }
}

const makePutRequest = async (requestUrl, payload) => {
    try {
        const { data } = await axios.put(requestUrl, payload)
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'PUT')
    }
}

const makeDeleteRequest = async (requestUrl, payload) => {
    try {
        const { data } = await axios.delete(requestUrl, payload)
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'DELETE')
    }
}

export const makeAxiosRequest = async (method, backendName, routeGroup, routePath, payload) => {
    const backendUrl = GET_BACKEND_URL(backendName)
    const requestUrl = backendUrl + routeGroup + routePath + '/'

    switch (method) {
        case HTTP_METHODS.GET:
            return await makeGetRequest(requestUrl, payload)
        case HTTP_METHODS.POST:
            return await makePostRequest(requestUrl, payload)
        case HTTP_METHODS.PUT:
            return await makePutRequest(requestUrl, payload)
        case HTTP_METHODS.DELETE:
            return await makeDeleteRequest(requestUrl, payload)
        default:
            console.log(`Invalid API method: ${method}`)
            return {}
    }
}

// toast-utils
export const simpleToast = (message, type, duration = 4000, style) => {
    toast(message, {
        type: type, //success, error, loading, blank
        position: "top-center",
        duration: duration,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        style: { style }
    })
}
