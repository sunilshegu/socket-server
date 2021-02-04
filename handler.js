'use strict';

// read env file
const dotenv = require('dotenv');
dotenv.config();

const AWS = require('aws-sdk');
const { openConnection } = require('./src/functions/connect');
const { deleteConnection } = require('./src/functions/disconnect');
const { getChatConnectionTableName } = require('./src/helpers/env.helpers');
let dynamo = new AWS.DynamoDB.DocumentClient();

require('aws-sdk/clients/apigatewaymanagementapi'); 

const CHAT_CONNECTION_TABLE = getChatConnectionTableName();

const successfulResponse = {
  statusCode: 200,
  body: 'everything is alright'
};

module.exports.connectionHandler = (event, _, callback) => {
  const queryParams = event.queryStringParameters;
  const { connectionId, eventType } = event.requestContext;

  if (eventType === 'CONNECT') {
    openConnection(connectionId, queryParams, (result) => {
      callback(null, result);
    });
  } else if (eventType === 'DISCONNECT') {
    deleteConnection(connectionId, (result) => {
      callback(null, result);
    });
  }
};

module.exports.defaultHandler = (event, _, callback) => {
  callback(null, {
    statusCode: 200,
    body: 'defaultHandler'
  });
};

module.exports.sendMessageHandler = (event, _, callback) => {
  sendMessageToAllConnected(event).then(() => {
    callback(null, successfulResponse)
  }).catch (err => {
    callback(null, JSON.stringify(err));
  });
}

const sendMessageToAllConnected = (event) => {
  return getConnectionIds().then(connectionData => {
    return connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId);
    });
  });
}

const getConnectionIds = () => {  
  const params = {
    TableName: CHAT_CONNECTION_TABLE,
    ProjectionExpression: 'connectionId'
  };

  return dynamo.scan(params).promise();
}

const send = (event, connectionId) => {
  const body = JSON.parse(event.body);
  const postData = body.data;  

  const endpoint = event.requestContext.domainName + "/" + event.requestContext.stage;
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endpoint
  });

  const params = {
    ConnectionId: connectionId,
    Data: postData
  };
  return apigwManagementApi.postToConnection(params).promise();
};
