export const getRedisHost = () => {
    return process.env.REDIS_HOST;
}

export const getRedisPort = () => {
    return process.env.REDIS_PORT;
}

export const getRedisPassword = () => {
    return process.env.REDIS_PASSWORD;
}

export const getChatConnectionTableName = () => {
    return process.env.CHAT_CONNECTION_TABLE;
}