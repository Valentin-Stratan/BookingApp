'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const sUtils = require('../utils/service-utils');
const utils = require('../utils/utils');
require('dotenv').config();

async function adminServiceDelete(event, context, callback) {
    try {
        const request = event.arguments;

        // get all bookings associated with provided service
        const bookings = await db.query({
            TableName: process.env.BOOKING_TABLE,
            IndexName: "booking-serviceId-index",
            KeyConditionExpression: "serviceId = :a",
            ExpressionAttributeValues: {
                ":a": request.serviceId
            }
        }).promise();

        // delete all bookings
        if (bookings.Items.length > 0) {
            const params = {
                TableName: process.env.BOOKING_TABLE,
                Key: {
                    id: request.serviceId
                }
            }
            for(let i =0; i < bookings.Items.length; i++) {
                params.Key.id = bookings.Items[i].id;
                await db.delete(params).promise();
            }
        }

        // delete provided service
        await db.delete({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            },
            ConditionExpression: 'attribute_exists(id)'
        }).promise();

        return callback(null, 'Service deleted successfuly');
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminServiceDelete = adminServiceDelete;