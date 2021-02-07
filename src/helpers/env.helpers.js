const getRedisURL = () => {
    return process.env.REDIS_URL;
}

const getChatConnectionTableName = () => {
    return process.env.CHAT_CONNECTION_TABLE;
}

const getChatConnectionIdGSI = () => {
    return process.env.CHAT_CONNECTION_ID_GSI;
}

const getEndpointURL = () => {
    return process.env.ENDPOINT_URL;
}

module.exports = {
    getRedisURL,
    getChatConnectionTableName,
    getChatConnectionIdGSI,
    getEndpointURL
}