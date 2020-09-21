'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const sUtils = require('../utils/service-utils');
const utils = require('../utils/utils');
require('dotenv').config();

async function adminServiceDelete(event, context, callback) {
    try {
        const request = event.arguments;

        await db.delete({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            },
            ConditionExpression: 'attribute_exists(id)'
        }).promise().catch(err => {
            return callback(utils.newError('Service with provided id not found!!!'), null);
        });

        return callback(null, 'Service deleted successfuly');
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminServiceDelete = adminServiceDelete;