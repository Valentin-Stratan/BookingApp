'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminCompanyDelete(event, context, callback) {
    try {
        const request = event.arguments;
        // validate company id
        const company = await db.get({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();

        if (!company)
            return callback(utils.newError('Company with provided ID not found!!!'), null);

        // get all the services associated with the provided company
        const services = await db.query({
            TableName: process.env.SERVICE_TABLE,
            IndexName: "companyId-index",
            KeyConditionExpression: "companyId = :a",
            ExpressionAttributeValues: {
                ":a": request.companyId
            }
        }).promise();

        //return callback(null, services.Items);

        // getting the url which include the s3 object key
        const url = company.Item.logo;
        // getting the starting index of s3 object key
        const startingIndex = cUtils.getKeyIndex(url);
        // getting the key
        const key = url.substring(startingIndex + 1);

        // delete the logo saved in s3-bucket 
        await S3.deleteObject({
            Bucket: process.env.LOGO_BUCKET,
            Key: key
        }).promise();

        // delete company entry in db
        await db.delete({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();

        // check if there are services associated with the company
        if(services.Items.length > 0) {
            const promiseArray = [];
            const params = {
                TableName: process.env.SERVICE_TABLE,
                Key: {
                    id: 'empty'
                }
            }
            for(let i = 0; i< services.Items.length; i++) {
                params.Key.id = services.Items[i].id;
                promiseArray.push(db.delete(params).promise());
            }
            await Promise.all(promiseArray);
            return callback(null, 'Company and services deleted successfuly ')
        }
        else {
            return callback(null, 'Company deleted successfuly')
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminCompanyDelete = adminCompanyDelete;