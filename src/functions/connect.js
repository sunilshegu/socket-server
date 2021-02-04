const AWS = require('aws-sdk');
const {
    getRedisClient
} = require('../db/redis');
const {
    getChatConnectionTableName
} = require('./../helpers/env.helpers');
let dynamo = new AWS.DynamoDB.DocumentClient();

const openConnection = (connectionId, queryParams, callback) => {
    const {
        token,
        userId
    } = queryParams;
    const retObj = {};

    if (!token) {
        retObj.message = 'Invalid token';
        callback(retObj);
    } else if (!userId) {
        retObj.message = 'Invalid userId';
        callback(retObj);
    } else {
        console.log("1-----redis--connection")
        const redisClient = getRedisClient();
        redisClient.get(token, (err, data) => {
            console.log("2---after connection", err, data);
            redisClient.end(true);
            if (err) {
                retObj.message = 'Error while authenticating';
                callback(retObj);
            } else if (!data) {
                retObj.message = 'Invalid token';
                callback(retObj);
            } else {
                const params = {
                    TableName: getChatConnectionTableName(),
                    Item: {
                        connectionId,
                        userId
                    }
                };

                dynamo.put(params, (err, _) => {
                    if (err) {
                        retObj.message = 'Error inserting in DB';
                        callback(retObj);
                    } else {
                        retObj.message = 'Successfully connected';
                        callback(retObj);
                    }
                })
            }
        });

    }
};

module.exports = {
    openConnection
}
