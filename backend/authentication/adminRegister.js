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

        // Check if first_name is not empty
        if (!request.first_name) {
            let error = new Error;
            error.message = 'First name is empty';
            return callback(error, null);
        }
        else {
            // trim first_name and check length
            request.first_name.trim();
            if (request.first_name.length > 20) {
                let error = new Error;
                error.message = 'Invalid first name';
                return callback(error, null);
            }
        }

        // Check if last_name is not empty
        if (!request.last_name) {
            let error = new Error;
            error.message = 'Last name is empty';
            return callback(error, null);
        }
        else {
            // trim last_name and check length
            request.last_name.trim();
            if (request.last_name.length > 20) {
                let error = new Error;
                error.message = 'Invalid last name';
                return callback(error, null);
            }
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
            await cognito.adminSetUserPassword({
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