const getRedisHost = () => {
    return process.env.REDIS_HOST;
}

const getRedisPort = () => {
    return process.env.REDIS_PORT;
}

const getChatConnectionTableName = () => {
    return process.env.CHAT_CONNECTION_TABLE;
}

const getChatConnectionIdGSI = () => {
    return process.env.CHAT_CONNECTION_ID_GSI;
}

module.exports = {
    getRedisHost,
    getRedisPort,
    getChatConnectionTableName,
    getChatConnectionIdGSI
}