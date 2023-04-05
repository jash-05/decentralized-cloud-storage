const PROTOCOL = 'http'
const BASE_URL = 'localhost'

const API_BACKEND = {
    STORJ: {
        NAME: 'storj/',
        PORT: '8080'
    },
    WEB3: {
        NAME: 'web3/',
        PORT: '8081',
    },
    MAIN: {
        NAME: '',
        PORT: '8082',
    }
}

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

export const GET_BACKEND_URL = (backendName) => {
    // example: http://localhost:8080/storj/
    return `${PROTOCOL}://${BASE_URL}:${API_BACKEND[backendName].PORT}/${API_BACKEND[backendName].NAME}/`
}
