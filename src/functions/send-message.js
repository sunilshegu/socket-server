const AWS = require('aws-sdk');
const axios = require('axios');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName,
    getEndpointURL,
    getAppURL
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

    console.log("send start==>");
    apigwManagementApi.postToConnection(params, (err, data) => {
        console.log("send end==>", err, data);
        callback(err, data);
    });
};

const saveMessage = (senderId, targetId, msgStr, token, timestampMillis) => {
    return axios({
        method: 'post',
        url: getAppURL() + '/doChat',
        headers: {
            Authorization: token
        },
        data: {
            userId: senderId,
            profileId: targetId,
            message: msgStr,
        }
    });
}

const sendMessage = (body, callback) => {
    const retObj = {};
    const { data } = body;
    const { senderId, targetId, message, token } = data;

    console.log("data==>", data)
    if (!senderId) {
        console.log("senderId==>", senderId)
        retObj.statusCode = 400;
        retObj.body = 'Invalid sender Id';
        callback(retObj);
    } else if (!targetId) {
        console.log("targetId==>", targetId)
        retObj.statusCode = 400;
        retObj.body = 'Invalid target user Id';
        callback(retObj);
    } else if (!message) {
        console.log("message==>", message)
        retObj.statusCode = 400;
        retObj.body = 'Invalid message';
        callback(retObj);
    } else {
        console.log("====>else")
        const findTargetUserParams = {
            TableName: getChatConnectionTableName(),
            Key: {
                userId: targetId.toString()
            }
        };

        console.log("dynamodb start")
        dynamo.get(findTargetUserParams, (err, getDataRes) => {
            console.log("dynamodb end", err, getDataRes)
            if (err) {
                retObj.statusCode = 500;
                retObj.body = 'Error while querying dynamodb';
                callback(retObj);
            } else {
                saveMessage(senderId, targetId, message, token, new Date()-0).then((res)=> {
                    console.log("Success saving message", res);
                }, (err) => {
                    console.log("Error while saving message", err, body);
                });

                if (getDataRes && getDataRes.Item && getDataRes.Item.connectionId) {
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
                    retObj.statusCode = 200;
                    retObj.body = 'Target user not registered';
                    callback(retObj);
                }
            }
        });
    }
}

module.exports = {
    sendMessage
}