'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const sUtils = require('../utils/service-utils');
const utils = require('../utils/utils');
require('dotenv').config();

async function adminServiceCreate(event, context, callback) {
    try {
        const request = event.arguments;
        // validation service name
        if (!sUtils.validateName(request.name))
            return callback(utils.newError('Invalid name'), null);

        // check if service with same name already exists
        const result = await db.query({
            TableName: process.env.SERVICE_TABLE,
            IndexName: "name-index",
            KeyConditionExpression: "#cn = :a",
            ExpressionAttributeNames: {
                "#cn": "name"
            },
            ExpressionAttributeValues: {
                ":a": request.name
            }
        }).promise();
        // return error if name is already in use
        if(result.Items.length != 0) {
            return callback(utils.newError('Service name already in use'), null);
        }

        // validation service description
        if (!sUtils.validateDescription(request.description))
            return callback(utils.newError('Invalid description'), null);
        // validation service duration
        if (!sUtils.validateDuration(request.duration))
            return callback(utils.newError('Invalid duration'), null);
        // validation service spaces
        if (!sUtils.validateSpaces(request.spaces))
            return callback(utils.newError('Invalid spaces'), null);
        // validation service price
        if (!sUtils.validatePrice(request.price))
            return callback(utils.newError('Invalid price'), null);

        // validate company id
        const company = await db.get({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();
        if (!company.Item)
            return callback(utils.newError('Company with provided ID not found!!!'), null);

        const service = {
            id: uuid.v4(),
            name: request.name,
            description: request.description,
            duration: request.duration,
            spaces: request.spaces,
            price: request.price,
            companyId: request.companyId
        }

        // creating the entry in database
        const response = await db.put({
            TableName: process.env.SERVICE_TABLE,
            Item: service
        }).promise();

        // check if service was creating and returning a response
        if (response) {
            return callback(null, service);
        }
        else {
            return callback(utils.newError('Unable to create the service'), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminServiceCreate = adminServiceCreate;