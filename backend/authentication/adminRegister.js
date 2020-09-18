'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const uuid = require('uuid');
const constants = require('../utils/utils');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function adminRegister(event, context, callback) {
    try {
        const request = event.arguments;
        const hashedPassword = bcrypt.hashSync(event.arguments.password, 10);

        // Firstname validation
        if (request.first_name.length > 20) {
            let error = new Error;
            error.message = 'Invalid firstname';
            return callback(error, null);
        }
        // Lastname validation
        if (request.last_name.length > 20) {
            let error = new Error;
            error.message = 'Invalid lastname';
            return callback(error, null);
        }
        // Email format validation
        if (!request.email.match(constants.mailFormat)) {
            let error = new Error;
            error.message = 'Invalid email format';
            return callback(error, null);
        }

        // Check if email exists in database
        const admins = await db.scan({
            TableName: process.env.ADMINS_TABLE
        }).promise();
        for (let i = 0; i < admins.Items.length; i++) {
            if (admins.Items[i].email == request.email) {
                let error = new Error;
                error.message = 'Email already in use';
                return callback(error, null);
            }
        }
        // Creating the admin in the database
        await db.put({
            TableName: process.env.ADMINS_TABLE,
            Item: {
                id: uuid.v4(),
                first_name: request.first_name,
                last_name: request.last_name,
                email: request.email,
                password: hashedPassword
            }
        }).promise();

        const result = await cognito.adminCreateUser({
            UserPoolId: process.env.USER_POOL_ID,
            Username: request.email,
            MessageAction: 'SUPPRESS',
            TemporaryPassword: request.password,
            UserAttributes: [
                {
                    Name: "email_verified",
                    Value: 'true'
                },
                {
                    Name: "email",
                    Value: request.email
                }
            ]
        }).promise();
        if (result) {
            // Confirm account status just for testing
            // Will be deleted 
            const result2 = await cognito.adminSetUserPassword({
                Password: request.password,
                Permanent: true,
                Username: request.email,
                UserPoolId: process.env.USER_POOL_ID
            }).promise();
            //
            return callback(null, 'Admin registered');
        }
        else {
            let error = new Error;
            error.message = 'Error at creating admin!!!';
            return callback(error, null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminRegister = adminRegister;