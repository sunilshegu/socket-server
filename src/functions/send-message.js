const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName,
    getEndpointURL
} = require('./../helpers/env.helpers');

const send = (msgStr, connectionId, callback) => {
    const endpoint = getEndpointURL();
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: endpoint
    });

    const params = {
        ConnectionId: connectionId,
        Data: msgStr
    };

    apigwManagementApi.postToConnection(params, (err, data) => {
        callback(err, data);
    });
};

const sendMessage = (body, callback) => {
    const retObj = {};
    const { data } = body;
    const { senderId, targetId, message } = data;

    if (!senderId) {
        retObj.statusCode = 400;
        retObj.body = 'Invalid sender Id';
        callback(retObj);
    } else if (!targetId) {
        retObj.statusCode = 400;
        retObj.body = 'Invalid target user Id';
        callback(retObj);
    } else if (!message) {
        retObj.statusCode = 400;
        retObj.body = 'Invalid message';
        callback(retObj);
    } else {
        const findTargetUserParams = {
            TableName: getChatConnectionTableName(),
            Key: {
                userId: targetId.toString()
            }
        };

        dynamo.get(findTargetUserParams, (err, getDataRes) => {
            if (err) {
                retObj.statusCode = 500;
                retObj.body = 'Error while querying dynamodb';
                callback(retObj);
            } else if (getDataRes && getDataRes.Item && getDataRes.Item.connectionId) {
                send(JSON.stringify(data), getDataRes.Item.connectionId, (err, data) => {
                    if (err) {
                        retObj.statusCode = 500;
                        retObj.body = 'Error while posting message to connection';
                        callback(retObj);
                    } else {
                        retObj.statusCode = 200;
                        retObj.body = 'Successfully sent';
                        callback(retObj);
                    }
                });
            } else {
                retObj.statusCode = 400;
                retObj.body = 'Target user not registered';
                callback(retObj);
            }
        });
    }
}

module.exports = {
    sendMessage
}