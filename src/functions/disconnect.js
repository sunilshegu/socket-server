const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName
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
            retObj.status = 500;
            retObj.message = 'Error deleting connection';
            callback(retObj);
        } else if (!data.Items.length) {
            retObj.status = 404;
            retObj.message = 'Connection not found';
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
                    retObj.status = 500;
                    retObj.message = 'Error deleting connection';
                    callback(retObj);
                } else {
                    retObj.status = 200;
                    retObj.message = 'Successfully deleted';
                    callback(retObj);
                }
            });
        }
    });

    dynamo.delete(params, (err) => {
        if (err) {
            retObj.status = 500;
            retObj.message = 'Error deleting connection';
        } else {
            retObj.status = 200;
            retObj.message = 'Successfully deleted';
        }
        callback(retObj);
    });
};

module.exports = {
    deleteConnection
}