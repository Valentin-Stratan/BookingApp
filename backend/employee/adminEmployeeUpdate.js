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

async function adminEmployeeUpdate(event, context, callback) {
    try {
        const request = event.arguments;
        const profileImageData = request.profile_image;

        //validate employee id
        const employee = await db.get({
            TableName: process.env.EMPLOYEE_TABLE,
            Key: {
                id: request.employeeId
            }
        }).promise();

        // If employee already have bookings he cant be updated
        // This feature will be added when publicBookingCreate will be modified to use employees

        if (!employee.Item) {
            return callback(utils.newError('Employee with provided ID not found'), null);
        }
        // validate email
        if (request.email && !bUtils.validateEmail(request.email))
            return callback(utils.newError('Invalid email'), null);

        // validate first name
        if (request.first_name && request.first_name.length > 20)
            return callback(utils.newError('Invalid first name!'), null);
        // validate last name
        if (request.last_name && request.last_name.length > 20)
            return callback(utils.newError('Invalid last name!'), null);

        // validate profile image
        // check if image is base64 encoded
        if (profileImageData && !eUtils.base64Format.test(profileImageData))
            return callback(utils.newError('Image have to be base64 encoded!!'), null);
        // check if base64 image have apropriate mime type(png)
        if (profileImageData && !profileImageData.includes(eUtils.imageMimeTypes)) {
            return callback(utils.newError('Wrong image mime type'), null);
        }

        // validate new serviceId
        if (request.serviceId) {
            const newService = await db.get({
                TableName: process.env.SERVICE_TABLE,
                Key: {
                    id: request.serviceId
                }
            }).promise();
            if (!(employee.Item.companyId === newService.Item.companyId)) {
                return callback(utils.newError('Invalid service ID'), null);
            }
        }

        // get service duration for validating working hours
        const service = await db.get({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: employee.Item.serviceId
            }
        }).promise();

        // validate working hours
        if (request.start_time && !eUtils.validateStartTime(request.start_time))
            return callback(utils.newError('Invalid start time'), null);
        if (request.finish_time && !eUtils.validateFinishTime(request.finish_time, employee.Item.start_time, service.Item.duration))
            return callback(utils.newError('Invalid finish time'), null);

        if (profileImageData) {
            // getting the url which include the s3 object key
            const url = employee.Item.profile_image;
            // getting the starting index of s3 object key
            const startingIndex = cUtils.getKeyIndex(url);
            // getting the key
            const key = url.substring(startingIndex + 1);
            // creating the buffer
            const buffer = Buffer.from(profileImageData, 'base64');

            // putObject updates data at key destination
            await S3.putObject({
                Body: buffer,
                Key: key,
                ContentType: 'image/png',
                Bucket: process.env.PROFILE_BUCKET,
                ACL: 'public-read'
            }).promise();
        }

        // creating objects for dynamic dynamodb update
        let updateExpression = 'set';
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};

        for (const property in request) {
            if (property != 'employeeId' && property != 'profile_image') {
                updateExpression += ` #${property} = :${property} ,`;
                ExpressionAttributeNames['#' + property] = property;
                ExpressionAttributeValues[':' + property] = request[property];
            }
        }
        updateExpression = updateExpression.slice(0, -1);

        // check if object expression attribute names is not empty
        if (!utils.objIsEmpty(ExpressionAttributeNames)) {
            // updating the company
            await db.update({
                TableName: process.env.EMPLOYEE_TABLE,
                Key: {
                    id: request.employeeId
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: ExpressionAttributeNames,
                ExpressionAttributeValues: ExpressionAttributeValues,
                ReturnValues: "ALL_NEW"
            }).promise();
        }
            
        return callback(null, 'Employee updated');
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminEmployeeUpdate = adminEmployeeUpdate;