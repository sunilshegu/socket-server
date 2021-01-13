const redis = require('redis');
const { getRedisHost, getRedisPort } = require('../helpers/env.helpers');

redisClient = redis.createClient({
    port: getRedisHost(),
    host: getRedisPort(),
});

module.exports = {
    redisClient
};
