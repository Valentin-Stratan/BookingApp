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

        //Temporary code, used until Company controller is done
        if(request.companyId == null || request.companyId == "") 
            request.companyId = uuid.v4();

        // creating the entry in database
        const response = await db.put({
            TableName: process.env.SERVICE_TABLE,
            Item: {
                id: uuid.v4(),
                name: request.name,
                description: request.description,
                duration: request.duration,
                spaces: request.spaces,
                price: request.price,
                companyId: request.companyId
            }
        }).promise();

        // check if service was creating and returning a response
        if (response) {
            return callback(null, 'Service created successfuly');
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