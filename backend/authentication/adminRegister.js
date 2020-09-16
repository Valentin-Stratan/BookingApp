'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
require('dotenv').config();
const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

async function adminRegister(event, context, callback) {
    try {
        // Firstname validation
        if(event.arguments.first_name.length > 20) {
            let error = new Error;
            error.message = 'Invalid firstname';
            return callback(error, null);
        }
        // Lastname validation
        if(event.arguments.last_name.length > 20) {
            let error = new Error;
            error.message = 'Invalid lastname';
            return callback(error, null);
        }
        // Email format validation
        if(!event.arguments.email.match(mailformat)) {
            let error = new Error;
            error.message = 'Invalid email format';
            return callback(error, null);
        }

        // Check if email exists in database
        const admins = await db.scan({
            TableName: process.env.ADMINS_TABLE
        }).promise();
        for(let i =0; i < admins.Items.length; i++) {
            if(admins.Items[i].email == event.arguments.email) {
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
                first_name: event.arguments.first_name,
                last_name: event.arguments.last_name,
                email: event.arguments.email,
                password: event.arguments.password
            }
        }).promise();
       
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const result = await cognito.adminCreateUser({
            UserPoolId: process.env.USER_POOL_ID,
            Username: event.arguments.email,
            MessageAction: 'SUPPRESS',
            TemporaryPassword: event.arguments.password,
            
        }).promise();
        if(result) {
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