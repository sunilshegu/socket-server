const redis = require('redis');
const { getRedisURL } = require('../helpers/env.helpers');

const getRedisClient = () => {
    return redis.createClient(getRedisURL());
}

module.exports = {
    getRedisClient
};
