'use strict';

// read env file
const dotenv = require('dotenv');
dotenv.config();

const AWS = require('aws-sdk');
const { openConnection } = require('./src/functions/connect');
const { deleteConnection } = require('./src/functions/disconnect');
const { getChatConnectionTableName } = require('./src/helpers/env.helpers');
const { sendMessage } = require('./src/functions/send-message');
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
      console.log("result===>", result)
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
  sendMessage(JSON.parse(event.body), (smResult) => {
    callback(null, smResult);
  });
}






