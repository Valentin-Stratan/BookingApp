'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const SES = new AWS.SES();
const uuid = require('uuid');
const constants = require('../utils/utils');
require('dotenv').config();

async function adminPasswordRecover(event, context, callback) {
    try {
        const request = event.arguments;
        // Email format validation
        if(!request.email.match(constants.mailFormat)) {
            let error = new Error;
            error.message = 'Invalid email format';
            return callback(error, null);
        }

        //Check if admin with this email exists in database
        const admin = await db.query({
            TableName: process.env.ADMINS_TABLE,
            IndexName: "email-index-copy",
            KeyConditionExpression: "email = :a",
            ExpressionAttributeValues: {
                ":a": request.email
            }
        }).promise();

        if(!admin){
            let error = new Error;
            error.message = 'Failed to find email in db';
            return callback(error, null);
        }
        //forgotPassword
        const response = await cognito.forgotPassword({
            ClientId: process.env.CLIENT_ID,
            Username: request.email
        }).promise();

        if(response) {
            return callback(null, 'Check email for confirmation code');
        }
        else {
            let error = new Error;
            error.message = 'Failed to send the confirmation code';
            return callback(error, null);
        }

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminPasswordRecover = adminPasswordRecover;