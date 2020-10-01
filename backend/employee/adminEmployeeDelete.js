'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const eUtils = require('../utils/employee-utils');
const bUtils = require('../utils/booking-utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminEmployeeDelete(event, context, callback) {
    try {
        const request = event.arguments;

        //validate employee id
        const employee = await db.get({
            TableName: process.env.EMPLOYEE_TABLE,
            Key: {
                id: request.employeeId
            }
        }).promise();
        
        if(!employee.Item)
            return callback(utils.newError('Employee with provided ID not found'), null);

        // If employee already have bookings he cant be updated
        const bookings = await db.query({
            TableName: process.env.BOOKING_TABLE,
            IndexName: 'employeeId-index',
            KeyConditionExpression: 'employeeId = :a',
            ExpressionAttributeValues: {
                ':a': request.employeeId
            }
        }).promise();

        if(bookings.Items.length > 0) {
            return callback(utils.newError("Employee can't be deleted because of existing bookings"), null);
        }

        // getting the url which include the s3 object key
        const url = employee.Item.profile_image;
        // getting the starting index of s3 object key
        const startingIndex = cUtils.getKeyIndex(url);
        // getting the key
        const key = url.substring(startingIndex + 1);

        // delete the logo saved in s3-bucket 
        await S3.deleteObject({
            Bucket: process.env.PROFILE_BUCKET,
            Key: key
        }).promise();

        // delete company entry in db
        const response = await db.delete({
            TableName: process.env.EMPLOYEE_TABLE,
            Key: {
                id: request.employeeId
            }
        }).promise();

        if(response) 
            return callback(null, "Employee deleted");

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminEmployeeDelete = adminEmployeeDelete;