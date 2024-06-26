const AWS = require('aws-sdk');
const {
    getRedisClient
} = require('../db/redis');
const {
    getChatConnectionTableName
} = require('./../helpers/env.helpers');

AWS.config.update({ region: 'ap-south-1' });
let dynamo = new AWS.DynamoDB.DocumentClient();

const openConnection = (connectionId, queryParams, callback) => {
    const {
        token,
        userId
    } = queryParams;
    const retObj = {};

    console.log("input===>", token, userId)
    if (!token) {
        retObj.statusCode = 400;
        retObj.body = 'Invalid token';
        callback(retObj);
    } else if (!userId) {
        retObj.statusCode = 400;
        retObj.body = 'Invalid userId';
        callback(retObj);
    } else {
        const redisClient = getRedisClient();
        console.log("redis start===>")
        redisClient.hget(token, 'user', (err, data) => {
            console.log("redis end===>", err, data)
            redisClient.end(true);
            if (err) {
                retObj.statusCode = 500;
                retObj.body = 'Error while authenticating';
                callback(retObj);
            } else if (!data) {
                retObj.statusCode = 400;
                retObj.body = 'Invalid token';
                callback(retObj);
            } else {
                const params = {
                    TableName: getChatConnectionTableName(),
                    Item: {
                        connectionId,
                        userId
                    }
                };

                console.log("dynamodb start===>")
                dynamo.put(params, (err, _) => {
                    console.log("dynamodb end===>")
                    if (err) {
                        retObj.statusCode = 500;
                        retObj.body = 'Error inserting in DB';
                        callback(retObj);
                    } else {
                        retObj.statusCode = 200;
                        retObj.body = 'Successfully connected';
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
