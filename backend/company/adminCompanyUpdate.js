'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminCompanyUpdate(event, context, callback) {
    try {
        const request = event.arguments;
        const logoData = event.arguments.logo;
        // validate company id
        const company = await db.get({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();
        if (!company)
            return callback(utils.newError('Company with provided ID not found!!!'), null);

        // validate logo
        if (request.logo) {
            if (!cUtils.base64Format.test(logoData))
                return callback(utils.newError('Logo have to be base64 encoded!!'), null);
            // check if base64 image have correct mime type(png)
            if (!logoData.includes(cUtils.logoMimeTypes)) {
                return callback(utils.newError('Wrong logo mime type'), null);
            }

            // getting the url which include the s3 object key
            const url = company.Item.logo;
            // getting the starting index of s3 object key
            const startingIndex = cUtils.getKeyIndex(url);
            // getting the key
            const key = url.substring(startingIndex + 1);
            // creating the buffer
            const buffer = Buffer.from(logoData, 'base64');

            // putObject updates data at key destination
            await S3.putObject({
                Body: buffer,
                Key: key,
                ContentType: 'image/png',
                Bucket: process.env.LOGO_BUCKET,
                ACL: 'public-read'
            }).promise();
        }

        // creating objects for dynamic dynamodb update
        let updateExpression = 'set';
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};

        for (const property in request) {
            if (property != 'companyId' && property != 'logo') {
                updateExpression += ` #${property} = :${property} ,`;
                ExpressionAttributeNames['#' + property] = property;
                ExpressionAttributeValues[':' + property] = request[property];
            }
        }
        updateExpression = updateExpression.slice(0, -1);

        // updating the company
        const response = await db.update({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }).promise();
        // check result and return response
        if (response) {
            // returning the updated item
            return callback(null, response.Attributes);
        }
        else return callback(utils.newError('Unable to update this company'), null);
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminCompanyUpdate = adminCompanyUpdate;