const AWS = require('aws-sdk');
const {
    redisClient
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
        redisClient.get(token, (err, data) => {
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
                        callback(null);
                    }
                })
            }
        });

    }
};

module.exports = {
    openConnection
}
