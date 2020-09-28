'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');
require('dotenv').config();
const cognito = new AWS.CognitoIdentityServiceProvider();

async function adminResetPassword(event, context, callback) {
    try {
        const request = event.arguments;
        const newHashedPassword = bcrypt.hashSync(request.newPass, 10);

        //validate admin
        const admin = await db.get({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: request.adminId,
            },
        }).promise();
        if(!admin.Item) {
            let error = new Error;
            error.message = 'Admin with provided ID not found';
            return callback(error, null);
        }
        
        // validate current password
        bcrypt.compare(request.currentPass, admin.Item.password, function(err, isMatch) {
            if(err)
                return callback(err, null);
            else if(!isMatch)
                return callback(utils.newError('Password don`t match'), null);
        });

        // accessing the token needed for change password
        const response = await cognito.adminInitiateAuth({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: process.env.CLIENT_ID,
            UserPoolId: process.env.USER_POOL_ID,
            AuthParameters: {
                USERNAME: admin.Item.email,
                PASSWORD: request.currentPass
            }
        }).promise();
        if(!response) {
            let error = new Error;
            error.message = 'Failed init auth admin';
            return callback(error, null);
        }

        await cognito.changePassword({
            AccessToken: response.AuthenticationResult.AccessToken,
            PreviousPassword: request.currentPass,
            ProposedPassword: request.newPass
        }).promise();

        // update the password in admins table
        const result = await db.update({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: request.adminId
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: 'set password = :v',
            ExpressionAttributeValues: {
                ':v': newHashedPassword
            },
            ReturnValue: 'ALL_NEW'
        }).promise();

        if (result) {
            return callback(null, 'Password updated successfuly');
        }
        else {
            return callback(utils.newError('Error at changing password'), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminResetPassword = adminResetPassword;