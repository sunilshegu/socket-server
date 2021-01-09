'use strict';

// read env file
const dotenv = require('dotenv');
dotenv.config();

const AWS = require('aws-sdk');
const { connectHandler } = require('./src/functions/connect');
const { getChatConnectionTableName } = require('./src/helpers/env.helpers');
let dynamo = new AWS.DynamoDB.DocumentClient();

require('aws-sdk/clients/apigatewaymanagementapi'); 

const CHAT_CONNECTION_TABLE = getChatConnectionTableName();

const successfullResponse = {
  statusCode: 200,
  body: 'everything is alright'
};

module.exports.connectionHandler = (event, context, callback) => {
  const queryParams = event.queryStringParameters;
  const { connectionId, eventType } = event.requestContext;

  if (eventType === 'CONNECT') {
    connectHandler(connectionId, queryParams, (err) => {
      console.log('Connect Error==>', err);
      if(err) {
        callback(null, JSON.stringify(err));
      } else {
        callback(null, successfullResponse);
      }
    });
  } else if (eventType === 'DISCONNECT') {
    deleteConnection(connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        console.log(err);
        callback(null, {
          statusCode: 500,
          body: 'Failed to connect: ' + JSON.stringify(err)
        });
      });
  }
};

// THIS ONE DOESNT DO ANYHTING
module.exports.defaultHandler = (event, context, callback) => {
  console.log('defaultHandler was called');
  console.log(event);

  callback(null, {
    statusCode: 200,
    body: 'defaultHandler'
  });
};

module.exports.sendMessageHandler = (event, context, callback) => {
  sendMessageToAllConnected(event).then(() => {
    callback(null, successfullResponse)
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

// const addConnection = connectionId => {
//   const params = {
//     TableName: CHAT_CONNECTION_TABLE,
//     Item: {
//       connectionId: connectionId 
//     }
//   };

//   return dynamo.put(params).promise();
// };

const deleteConnection = connectionId => {
  const params = {
    TableName: CHAT_CONNECTION_TABLE,
    Key: {
      connectionId: connectionId 
    }
  };

  return dynamo.delete(params).promise();
};