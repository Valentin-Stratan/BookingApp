'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminCompanyView(event, context, callback) {
    try {
        const request = event.arguments;
        
        const companies = await db.query({
            TableName: process.env.COMPANY_TABLE,
            IndexName: "adminId-index",
            KeyConditionExpression: "adminId = :a",
            ExpressionAttributeValues: {
                ":a": request.adminId
            }
        }).promise();

        if(companies.Items.length > 0) {
            return callback(null, companies.Items);
        }
        else {
            return callback(utils.newError('Companies for this administrator not found!!'), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminCompanyView = adminCompanyView;