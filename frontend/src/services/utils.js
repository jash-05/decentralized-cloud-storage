import axios from 'axios'
import { GET_BACKEND_URL, HTTP_METHODS } from '../constants/constants'
import toast from 'react-hot-toast';


const printErrorMessage = (err) => {
    console.log(`Error occured: ${err}`)
}

const makeGetRequest = async (requestUrl, params) => {
    try {
        const { data } = await axios.get(requestUrl, { params: params })
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'GET')
        return err;
    }
}

const makePostRequest = async (requestUrl, payload, params) => {
    try {
        const { data } = await axios.post(requestUrl, payload, { params: params })
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'POST')
        return err;
    }
}

const makePutRequest = async (requestUrl, payload) => {
    try {
        const { data } = await axios.put(requestUrl, payload)
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'PUT')
        return err;
    }
}

const makeDeleteRequest = async (requestUrl, params) => {
    try {
        const { data } = await axios.delete(requestUrl, { params: params })
        return data
    } catch (err) {
        printErrorMessage(err, requestUrl, 'DELETE')
        return err;
    }
}

export const makeAxiosRequest = async (method, backendName, routeGroup, routePath, payload = null, params = null) => {
    const backendUrl = GET_BACKEND_URL(backendName)
    const requestUrl = backendUrl + routeGroup + '/' + routePath

    console.log(`Request URL: ${requestUrl}`)
    console.log(`Method: ${method}`)
    console.log(`Payload: ${JSON.stringify(payload)}`)
    console.log(`Params: ${JSON.stringify(params)}`)

    switch (method) {
        case HTTP_METHODS.GET:
            return await makeGetRequest(requestUrl, params)
        case HTTP_METHODS.POST:
            return await makePostRequest(requestUrl, payload, params)
        case HTTP_METHODS.PUT:
            return await makePutRequest(requestUrl, payload)
        case HTTP_METHODS.DELETE:
            return await makeDeleteRequest(requestUrl, params)
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
