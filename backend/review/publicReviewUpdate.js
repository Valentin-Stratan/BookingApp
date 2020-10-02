'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config();

async function publicReviewUpdate(event, context, callback) {
    try {
        const request = event.arguments;

        // validate provided review ID
        const review = await db.get({
            TableName: process.env.REVIEW_TABLE,
            Key: {
                id: request.reviewId
            }
        }).promise();

        if (!review.Item)
            return callback(utils.newError('Unable to find review with provided ID'), null);

        // validate client name
        if(request.clientName != review.Item.clientName)
            return callback(utils.newError('Wrong client name'), null);

         // validate stars
         if(request.stars && (request.stars > 5 || request.stars < 1))
            return callback(utils.newError('Number of stars should be between 1 and 5'), null);


        // censor the reviewText
        const censoredText = utils.censor(request.reviewText, utils.filterWords);
        request.reviewText = censoredText;

        // creating objects for dynamic dynamodb update
        let updateExpression = 'set';
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};

        for (const property in request) {
            if (property != 'reviewId') {
                updateExpression += ` #${property} = :${property} ,`;
                ExpressionAttributeNames['#' + property] = property;
                ExpressionAttributeValues[':' + property] = request[property];
            }
        }
        updateExpression = updateExpression.slice(0, -1);

        // updating the review
        const response = await db.update({
            TableName: process.env.REVIEW_TABLE,
            Key: {
                id: request.reviewId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }).promise();
        // check result and return response
        if (response) {
            // returning the updated item
            return callback(null, response.Attributes);
        }
        else return callback(utils.newError('Unable to update this review'), null);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicReviewUpdate = publicReviewUpdate;