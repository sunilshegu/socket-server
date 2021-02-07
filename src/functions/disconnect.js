const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName,
    getChatConnectionIdGSI
} = require('./../helpers/env.helpers');

const deleteConnection = (connectionId, callback) => {
    const retObj = {};
    const findConnRecordParams = {
        TableName: getChatConnectionTableName(),
        IndexName: getChatConnectionIdGSI(),
        KeyConditionExpression: "connectionId = :connectionId",
        ExpressionAttributeValues: {
            ":connectionId": connectionId,
        }
    };

    dynamo.query(findConnRecordParams, (err, data) => {
        if (err) {
            retObj.statusCode = 500;
            retObj.body = 'Error deleting connection';
            callback(retObj);
        } else if (!data.Items.length) {
            retObj.statusCode = 404;
            retObj.body = 'Connection not found';
            callback(retObj)
        } else {
            const deleteConnParams = {
                TableName: getChatConnectionTableName(),
                Key: {
                    userId: data.Items[0].userId,
                }
            };

            dynamo.delete(deleteConnParams, (err) => {
                if (err) {
                    retObj.statusCode = 500;
                    retObj.body = 'Error deleting connection';
                    callback(retObj);
                } else {
                    retObj.statusCode = 200;
                    retObj.body = 'Successfully deleted';
                    callback(retObj);
                }
            });
        }
    });
};

module.exports = {
    deleteConnection
}