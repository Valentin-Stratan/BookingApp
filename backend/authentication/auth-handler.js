'use strict';

const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

module.exports.authController = async (event, context, callback) => {
    switch (event.field) {
        //---------- ADMIN REGISTRATION ----------
        case 'adminRegister': {
            try {
                // Firstname validation
                if (event.arguments.first_name.length > 20) {
                    let error = new Error;
                    error.message = 'Invalid firstname';
                    callback(error, null);
                }
                // Lastname validation
                if (event.arguments.last_name.length > 20) {
                    let error = new Error;
                    error.message = 'Invalid lastname';
                    callback(error, null);
                }
                // Email format validation
                if (!event.arguments.email.match(mailformat)) {
                    let error = new Error;
                    error.message = 'Invalid email format';
                    callback(error, null);
                }
                // Check if email exists in database
                await db.scan({
                    TableName: "BookingApp-admins",
                })
                    .promise()
                    .then(result => {
                        for (let i = 0; i < result.Items.length; i++) {
                            if (result.Items[i].email == event.arguments.email) {
                                let error = new Error;
                                error.message = 'Email already in use';
                                callback(error, null);
                            }
                        }
                    })
                // Creating the admin in the database
                await db.put({
                    TableName: "BookingApp-admins",
                    Item: {
                        id: uuid.v4(),
                        first_name: event.arguments.first_name,
                        last_name: event.arguments.last_name,
                        email: event.arguments.email,
                        password: event.arguments.password
                    }
                }).promise();
                // Creating the admin in cognito user-pool
                const cognito = new AWS.CognitoIdentityServiceProvider();
                await cognito.adminCreateUser({
                    UserPoolId: "eu-central-1_wxkQGwd6a",
                    Username: event.arguments.email,
                    MessageAction: 'SUPPRESS',
                    TemporaryPassword: event.arguments.password
                })
                    .promise()
                    .then(() => {
                        callback(null, 'Admin registered');
                    })
                    .catch(err => callback(err, null));
            }
            catch (error) {
                callback(error, null);
            }
            break;
        }
        //---------- ADMIN LOG IN ----------
        case 'adminLogin': {
            try {

            }
            catch (error) {
                callback(error, null);
            }
            break;
        }
        //---------- LIST ALL ADMINS ----------
        case 'adminList': {
            try {
                await db.scan({
                    TableName: "BookingApp-admins",
                })
                    .promise()
                    .then(result => {
                        callback(null, result.Items);
                    })
            }
            catch (error) {
                callback(null, error);
            }
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};