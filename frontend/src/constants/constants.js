const PROTOCOL = 'http'
const BASE_URL = 'localhost'

const API_BACKEND = {
    STORJ: {
        NAME: 'storj/',
        PORT: '8080'
    },
    WEB3: {
        NAME: 'web3/',
        PORT: '8082',
    },
    MAIN: {
        NAME: '',
        PORT: '8081',
    }
}

export const BACKEND_NAMES = {
    STORJ: 'STORJ',
    WEB3: 'WEB3',
    MAIN: 'MAIN'
}

export const GET_BACKEND_URL = (backendName) => {
    // example: http://localhost:8080/storj/
    return `${PROTOCOL}://${BASE_URL}:${API_BACKEND[backendName].PORT}/${API_BACKEND[backendName].NAME}`
}

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

export const ROUTE_GROUPS = {
    RENTER: 'renter',
    BUCKET: 'bucket',
    FILE: 'file'
}

export const ROUTE_PATHS = {
    REGISTER: 'register',
    LOGIN: 'login',
    UPDATE_PROFILE: 'updateProfile',
    GET_PROFILE: 'getProfile',
    UPLOAD_FILE: 'uploadFile',
    DOWNLOAD_FILE: 'downloadFile',
    DELETE_FILE: 'delete',
    GET_FILES: 'getFiles',
    CREATE_BUCKET: 'create',
    GET_BUCKETS: 'getBucketsForRenter',
    EMPTY_BUCKET: 'empty',
    DELETE_BUCKET: 'delete',
    VIEW_FILE_METADATA: 'viewFileMetadata',
    GET_HIGH_LEVEL_METRICS: 'getHighLevelMetrics'
}