const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const {
    getChatConnectionTableName
} = require('./../helpers/env.helpers');

const send = (jsonData, connectionId) => {
    const endpoint = 'ciu7j53cd3.execute-api.us-east-1.amazonaws.com/dev';
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endpoint
    });
  
    const params = {
      ConnectionId: connectionId,
      Data: {
        hello: 'pollo'
      }
    };
    return apigwManagementApi.postToConnection(params).promise();
};

const sendMessage = (body, callback) => {
    const retObj = {};
    const { data } = body;
    const { senderId, targetId, message } = data;

    if (!senderId) {
        retObj.status = 400;
        retObj.message = 'Invalid sender Id';
        callback(retObj);
    } else if (!targetId) {
        retObj.status = 400;
        retObj.message = 'Invalid target user Id';
        callback(retObj);
    } else if (!message) {
        retObj.status = 400;
        retObj.message = 'Invalid message';
        callback(retObj);
    } else {
        const findTargetUserParams = {
            TableName: getChatConnectionTableName(),
            KeyConditionExpression: "userId = :userIdValue",
            ExpressionAttributeValues: {
                ":userIdValue": targetId,
            }
        };

        dynamo.query(findTargetUserParams, (err, data) => {
            if (err) {
                retObj.status = 500;
                retObj.message = 'Error while querying dynamodb';
                callback(retObj);
            } else if (data && data.Items && data.Items.length) {
                send({}, data.Items[0].connectionId).then(() => {
                    retObj.status = 200;
                    retObj.message = 'Successfully sent';
                    callback(retObj);
                }).catch((err) => {
                    retObj.status = 500;
                    retObj.message = 'Error while posting message to connection';
                })
            } else {
                retObj.status = 200;
                retObj.message = 'Target user not registered';
                callback(retObj);
            }
        });
    }
}

module.exports  = {
    sendMessage
}