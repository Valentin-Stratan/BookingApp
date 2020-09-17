'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
require('dotenv').config();

async function adminPasswordConfirm(event, context, callback) {
    try {
        // Get the recovery code from db for this user
        const recoveryCodes = await db.scan({
            TableName: process.env.RECOVERY_CODES_TABLE
        }).promise();

        let recoveryEntry;
        for (let i = 0; i < recoveryCodes.Items.length; i++) {
            if (recoveryCodes.Items[i].code == event.arguments.confirmationCode) {
                recoveryEntry = recoveryCodes.Items[i];
            }
        }
        // Check if recovery entry exists in db
        if (!recoveryEntry) {
            let error = new Error;
            error.message = 'User not found!!!';
            return callback(error, null);
        }

        // Check if confirmation code sent by user is valid
        if (recoveryEntry.code != event.arguments.confirmationCode) {
            let error = new Error;
            error.message = 'Confirmation code is not valid';
            return callback(error, null);
        }

        //get admin for authentication
        const admin = await db.get({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: recoveryEntry.admin_id,
            },
        }).promise();
        if(!admin) {
            let error = new Error;
            error.message = 'Failed to get admin from db';
            return callback(error, null);
        }
        //return callback(null, `${admin.Item.email}`);
        // update the password in cognito user pool
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const response = await cognito.adminInitiateAuth({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: process.env.CLIENT_ID,
            UserPoolId: process.env.USER_POOL_ID,
            AuthParameters: {
                USERNAME: admin.Item.email,
                PASSWORD: admin.Item.password
            }
        }).promise();
        if(!response) {
            let error = new Error;
            error.message = 'Failed init auth admin';
            return callback(error, null);
        }

        await cognito.changePassword({
            AccessToken: response.AuthenticationResult.AccessToken,
            PreviousPassword: event.arguments.oldPassword,
            ProposedPassword: event.arguments.newPassword
        }).promise();

        // update the password in admins table
        const result = await db.update({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: recoveryEntry.admin_id
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: 'set password = :v',
            ExpressionAttributeValues: {
                ':v': event.arguments.newPassword
            },
            ReturnValue: 'ALL_NEW'
        }).promise();

        if (result) {
            // delete recovery entry in database
            await db.delete({
                TableName: process.env.RECOVERY_CODES_TABLE,
                Key: {
                    id: recoveryEntry.id
                }
            }).promise();

            return callback(null, 'Password updated successfuly');
        }
        else {
            let error = new Error;
            error.message = 'Error at changing password';
            return callback(error, null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminPasswordConfirm = adminPasswordConfirm;