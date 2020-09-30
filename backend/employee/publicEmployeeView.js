'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config(); 

async function publicEmployeeView(event, context, callback) {
    try {
        const request = event.arguments;

        // validate service id
        const service = await db.get({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            }
        }).promise();

        if(!service.Item)
            return callback(utils.newError('Invalid service ID provided'), null);

        // get employees
        const employees = await db.query({
            TableName: process.env.EMPLOYEE_TABLE,
            IndexName: "serviceId-index",
            KeyConditionExpression: "serviceId = :a",
            ExpressionAttributeValues: {
                ":a": request.serviceId
            }
        }).promise();

        if(employees.Items) {
            return callback(null, employees.Items);
        }
        else 
            return callback(utils.newError('Unable to return employees'), null);
        
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicEmployeeView = publicEmployeeView;