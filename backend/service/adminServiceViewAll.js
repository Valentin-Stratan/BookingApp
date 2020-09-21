'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const sUtils = require('../utils/service-utils');
const utils = require('../utils/utils');
require('dotenv').config();

async function adminServiceViewAll(event, context, callback) {
    try {
        const request = event.arguments;
        
        const services = await db.query({
            TableName: process.env.SERVICE_TABLE,
            IndexName: "companyId-index",
            KeyConditionExpression: "companyId = :a",
            ExpressionAttributeValues: {
                ":a": request.companyId
            }
        }).promise();

        if(services.Items.length > 0) {
            return callback(null, services.Items);
        }
        else {
            return callback(utils.newError('Services for this company not found!!'), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminServiceViewAll = adminServiceViewAll;