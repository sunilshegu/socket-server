const getRedisURL = () => {
    return process.env.REDIS_URL;
}

const getChatConnectionTableName = () => {
    return process.env.CHAT_CONNECTION_TABLE;
}

const getChatConnectionIdGSI = () => {
    return process.env.CHAT_CONNECTION_ID_GSI;
}

module.exports = {
    getRedisURL,
    getChatConnectionTableName,
    getChatConnectionIdGSI
}