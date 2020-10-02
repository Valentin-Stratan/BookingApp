'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config(); 

async function publicReviewView(event, context, callback) {
    try {
        const request = event.arguments;
        // validate employeeID
        const employee = await db.get({
            TableName: process.env.EMPLOYEE_TABLE,
            Key: {
                id: request.employeeId
            }
        }).promise();

        if(!employee.Item)
            return callback(utils.newError('Employee with provided ID not found'), null);

        const reviews =  await db.query({
            TableName: process.env.REVIEW_TABLE,
            IndexName: "employeeId-index",
            KeyConditionExpression: "employeeId = :id",
            ExpressionAttributeValues: {
                ":id": request.employeeId
            }
        }).promise();

        if(reviews.Items)
            return callback(null, reviews.Items);
        else 
            return callback(utils.newError('Failed to get reviews'), null);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicReviewView = publicReviewView;