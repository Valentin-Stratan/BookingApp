'use strict';
const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
require('dotenv').config();

async function publicBookingDelete(event, context, callback) {
    try {
        const request = event.arguments;
	
	// delete booking
        await db.delete({
            TableName: process.env.BOOKING_TABLE,
            Key: {
                id: request.bookingId
            },
            ConditionExpression: 'attribute_exists(id)'
        }).promise();
	
        return callback(null, 'Booking deleted successfuly');
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicBookingDelete = publicBookingDelete;