import axios from 'axios'
import info from '../config.json'

const apiEndpoint = info.storjBackend + 'renter/'

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


export function getCurrentUser() {
    try {
        const user = localStorage.getItem('user')
        return user
    } catch (e) {
        console.log(e)
    }
}
