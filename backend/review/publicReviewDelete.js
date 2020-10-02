'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const eUtils = require('../utils/employee-utils');

require('dotenv').config();

async function publicReviewDelete(event, context, callback) {
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

        // validate provided client name
        if(review.Item.clientName != request.clientName)
            return callback(utils.newError('Wrong client name provided'), null);

        // delete provided review
        await db.delete({
            TableName: process.env.REVIEW_TABLE,
            Key: {
                id: request.reviewId
            },
            ConditionExpression: 'attribute_exists(id)'
        }).promise();

        return callback(null, 'Review deleted successfuly');


    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicReviewDelete = publicReviewDelete;