'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const sUtils = require('../utils/service-utils');
const utils = require('../utils/utils');
require('dotenv').config();

async function adminServiceUpdate(event, context, callback) {
    try {
        const request = event.arguments;

        // validating dynamically input arguments
        for (const property in request) {
            switch (property) {
                case 'duration': {
                    if (!sUtils.dynamicallyValidateDuration(request.duration))
                        return callback(utils.newError('Invalid duration'), null);
                    break;
                }
                case 'price': {
                    if (!sUtils.dynamicallyValidatePrice(request.price))
                        return callback(utils.newError('Invalid price'), null);
                    break;
                }
                case 'spaces': {
                    if (!sUtils.dynamicallyValidateSpaces(request.spaces))
                        return callback(utils.newError('Invalid spaces'), null);
                    break;
                }
            }
        }

        // creating objects for dynamic dynamodb update
        let updateExpression = 'set';
        let ExpressionAttributeNames = {};
        let ExpressionAttributeValues = {};

        for (const property in request) {
            if (property != 'serviceId') {
                updateExpression += ` #${property} = :${property} ,`;
                ExpressionAttributeNames['#' + property] = property;
                ExpressionAttributeValues[':' + property] = request[property];
            }
        }
        updateExpression = updateExpression.slice(0, -1);

        // updating the service
        const response = await db.update({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues
        }).promise();
        // check result and return response
        if (response) {
            // returning the updated item
            const service = await db.get({
                TableName: process.env.SERVICE_TABLE,
                Key: {
                    id: request.serviceId
                }
            }).promise();
            return callback(null, service.Item);
        }
        else return callback(utils.newError('Unable to update this service'), null);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminServiceUpdate = adminServiceUpdate;