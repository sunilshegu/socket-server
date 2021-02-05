const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName
} = require('./../helpers/env.helpers');

const send = (jsonData, connectionId, callback) => {
    const endpoint = 'https://ciu7j53cd3.execute-api.us-east-1.amazonaws.com/dev';
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: endpoint
    });

    const params = {
        ConnectionId: connectionId,
        Data: "Hello"
    };
    console.log("send connectionId===>", params);
    apigwManagementApi.postToConnection(params, (err, data) => {
        console.log("post conn==>", err, data)
        callback(err, data);
    });
};

const sendMessage = (body, callback) => {
    const retObj = {};
    const { data } = body;
    const { senderId, targetId, message } = data;
    console.log("smdata===>", data);

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

        dynamo.get(findTargetUserParams, (err, data) => {
            console.log("dynamo===>", err, data, findTargetUserParams);
            if (err) {
                retObj.statusCode = 500;
                retObj.body = 'Error while querying dynamodb';
                callback(retObj);
            } else if (data && data.Item && data.Item.connectionId) {
                send({}, data.Item.connectionId, (err, data) => {
                    if (err) {
                        console.log("send message err====>", err)
                        retObj.statusCode = 500;
                        retObj.body = 'Error while posting message to connection';
                        callback(retObj);
                    } else {
                        console.log("------success-----", data)
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