'use strict';

const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
require('dotenv').config();

async function adminList(event, context, callback) {
    try {
        const result = await db.scan({
            TableName: process.env.ADMINS_TABLE,
        }).promise();

        if (result) {
            return callback(null, result.Items);
        }
        else {
            let error = new Error;
            error.message = 'Something went wrong!!!';
            return callback(error, null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminList = adminList;