const AWS = require('aws-sdk');
const {
    getChatConnectionTableName
} = require('./../helpers/env.helpers');
let dynamo = new AWS.DynamoDB.DocumentClient();

const connectHandler = (connectionId, queryParams, callback) => {
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
                callback(null);
            }
        })
    }
};

module.exports = {
    connectHandler
}
