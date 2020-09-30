'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config(); 

async function adminEmployeeView(event, context, callback) {
    try {
        const request = event.arguments;

        // validate company id
        const company = await db.get({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();

        if(!company.Item)
            return callback(utils.newError('Invalid company ID provided'), null);

        // get employees
        const employees = await db.query({
            TableName: process.env.EMPLOYEE_TABLE,
            IndexName: "companyId-index",
            KeyConditionExpression: "companyId = :a",
            ExpressionAttributeValues: {
                ":a": request.companyId
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

module.exports.adminEmployeeView = adminEmployeeView;