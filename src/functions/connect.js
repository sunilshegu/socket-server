const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

export const connectHandler = (connectionId, queryParams, callback) => {
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
            TableName: CHAT_CONNECTION_TABLE,
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