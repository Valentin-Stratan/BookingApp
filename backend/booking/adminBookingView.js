'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
require('dotenv').config();

async function adminBookingView(event, context, callback) {
    try {
        const adminId = event.arguments.adminId;

        // validate provided id
        const admin = await db.get({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: adminId
            }
        }).promise();

        if (!admin.Item)
            return callback(utils.newError('Admin with provided ID not found!!!'), null);

        // getting all the companies of provided admin
        const companies = await db.query({
            TableName: process.env.COMPANY_TABLE,
            IndexName: "adminId-index",
            KeyConditionExpression: "adminId = :a",
            ExpressionAttributeValues: {
                ":a": adminId
            }
        }).promise();


        // variable for storing all companies of specific admin
        const bookingViewList = [];

        for (let i = 0; i < companies.Items.length; i++) {
            const response = await db.query({
                TableName: process.env.BOOKING_TABLE,
                IndexName: "booking-test-companyId-index",
                KeyConditionExpression: "companyId = :a",
                ExpressionAttributeValues: {
                    ":a": companies.Items[i].id
                }
            }).promise();
            // variable for storing company and services
            const bookingView = {};
            bookingView.company = companies.Items[i];
            bookingView.bookings = response.Items;
            // storing companies data
            bookingViewList.push(bookingView);
        }
        // if there are no companies or services empty array will be returned
        return callback(null, bookingViewList);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminBookingView = adminBookingView;