'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const constants = require('../utils/utils');
require('dotenv').config();
const cognito = new AWS.CognitoIdentityServiceProvider();

async function adminPasswordConfirm(event, context, callback) {
    try {
        const request = event.arguments;
        const newHashedPassword = bcrypt.hashSync(request.newPassword, 10);

        //Check email format
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
        
        if(!admin) {
            let error = new Error;
            error.message = 'Admin with provided email not found';
            return callback(error, null);
        }
        
        await cognito.confirmForgotPassword({
            ClientId: process.env.CLIENT_ID,
            ConfirmationCode: request.confirmationCode,
            Password: request.newPassword,
            Username: request.email
        }).promise();

        // update the password in admins table
        const result = await db.update({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: admin.Items[0].id
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: 'set password = :v',
            ExpressionAttributeValues: {
                ':v': newHashedPassword
            },
            ReturnValue: 'ALL_NEW'
        }).promise();

        if(result) {
            return callback(null, 'Password recover successfuly');
        }
        else {
            let error = new Error;
            error.message = 'Invalid email format';
            return callback(error, null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminPasswordConfirm = adminPasswordConfirm;