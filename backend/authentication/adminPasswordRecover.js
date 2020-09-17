'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const SES = new AWS.SES();
const uuid = require('uuid');
require('dotenv').config();

const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

async function adminPasswordRecover(event, context, callback) {
    try {
        // Email format validation
        if(!event.arguments.email.match(mailformat)) {
            let error = new Error;
            error.message = 'Invalid email format';
            return callback(error, null);
        }

        // Check if user with email exists in database
        const admins = await db.scan({
            TableName: process.env.ADMINS_TABLE,
        }).promise();
        let admin;
        for(let i =0; i < admins.Items.length; i++) {
            if(admins.Items[i].email == event.arguments.email) {
                admin = admins.Items[i];
            }
        }
        if(!admin) {
            let error = new Error;
            error.message = 'Email not found';
            return callback(error, null);
        }

        // Creating the entry in recovery codes table with the user and confirmation code
        const recoveryCode = {
            id: uuid.v4(),
            admin_id: admin.id,
            code: uuid.v4()
        }

        const result = await db.put({
            TableName: process.env.RECOVERY_CODES_TABLE,
            Item: recoveryCode
        }).promise();

        if(result) {
            // If the recovery code was successfully created, send email to the user
            const text = `Your recovery code for email: ${event.arguments.email} is ${recoveryCode.code}`;
            const subject = 'Admin password recovery';
            // Email data object
            const params = {
                Destination: {
                    ToAddresses: [event.arguments.email]
                },
                Message: {
                    Body: {
                        // text represents the body message with all data
                        Text: { Data: text} 
                    },
                    // subject represents the subject of sent email
                    Subject: { Data: subject}
                },
                // Email that we are sending from
                Source: process.env.ADMIN_EMAIL
            }

            await SES.sendEmail(params).promise();

            return callback(null, `Check you email for recovery code`);
        }
        else {
            let error = new Error;
            error.message = 'Error at sending the recovery-code';
            return callback(error, null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminPasswordRecover = adminPasswordRecover;