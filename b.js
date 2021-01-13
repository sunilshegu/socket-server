const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
let dynamo = new AWS.DynamoDB.DocumentClient();

const params = {
    TableName: 'dev-connection-ddb',
    IndexName: 'connectionId-index',
    KeyConditionExpression: "connectionId = :connectionId",
    ExpressionAttributeValues: {
        ":connectionId": "Y699keU9oAMCEzw=2",
    }
};

dynamo.query(params, (err, data) => {
    console.log("===>", err, data);
});