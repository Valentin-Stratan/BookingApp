'use strict';

const AWS = require('aws-sdk');
require('dotenv').config();

async function adminLogin(event, context, callback) {
    try {
        const cognito = new AWS.CognitoIdentityServiceProvider();
        //const response = 
        const response = await cognito.adminInitiateAuth({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: process.env.CLIENT_ID,
            UserPoolId: process.env.USER_POOL_ID,
            AuthParameters: {
                USERNAME: event.arguments.email,
                PASSWORD: event.arguments.password
            }
        }).promise();
        if (response) {
            return callback(null, response.AuthenticationResult.AccessToken);
        }
        else {
            let error = new Error;
            error.message = 'Error at authentication!!!';
            return callback(error, null);
        } 
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminLogin = adminLogin;