'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config(); 

async function publicReviewCreate(event, context, callback) {
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

        // validate clientName
        if(request.clientName.length > 40)
            return callback(utils.newError('Provided name is too long'), null);

        // validate stars
        if(request.stars > 5 && request.stars < 1)
            return callback(utils.newError('Number of stars should be between 1 and 5'), null);


        // censor the reviewText
        const censoredText = utils.censor(request.reviewText, utils.filterWords);

        const params = {
            TableName: process.env.REVIEW_TABLE,
            Item: {
                id: uuid.v4(),
                employeeId: request.employeeId,
                clientName: request.clientName,
                stars: request.stars,
                reviewText: censoredText
            }
        }

        const response = await db.put(params).promise();

        if(response) 
            return callback(null, params.Item);
        else 
            return callback(utils.newError('Failed to create the review'), null);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicReviewCreate = publicReviewCreate;