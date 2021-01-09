const getRedisHost = () => {
    return process.env.REDIS_HOST;
}

const getRedisPort = () => {
    return process.env.REDIS_PORT;
}

const getRedisPassword = () => {
    return process.env.REDIS_PASSWORD;
}

const getChatConnectionTableName = () => {
    return process.env.CHAT_CONNECTION_TABLE;
}

module.exports = {
    getRedisHost,
    getRedisPort,
    getRedisPassword,
    getChatConnectionTableName
}