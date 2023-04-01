import axios from 'axios'
import { storjBackend } from '../config.json'

const apiEndpoint = storjBackend + 'renter/'

export async function getRenterInfo() {
    const { data } = await axios.get(apiEndpoint + "info")
    return data
}

export async function registerRenter(palyoad) {
    try {
        const { data } = await axios.post(apiEndpoint + "register")
        return data

    } catch (e) {
        console.log(e)
    }
}

//logout -> use cookie or localstorage
export function logout() {
    console.log("logout called")
    localStorage.removeItem('token')

}

export async function loginRenter(payload) {

    try {
        const { data } = await axios.post(apiEndpoint + "login", payload)
        return data
    } catch (e) {
        console.log(e)
    }
}

