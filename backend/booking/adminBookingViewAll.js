'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
require('dotenv').config();

async function adminBookingViewAll(event, context, callback) {
    try {
        const admins = await db.scan({
            TableName: process.env.ADMINS_TABLE
        }).promise();

        // variable for storing all the data
        const bookingViewAllList = [];
        
        for (let i = 0; i < admins.Items.length; i++) {
            // variable for storing all data for a specific admin
            const bookingViewAll = {};
            // variable for storing all companies and services for specific admin
            const bookingViewList = [];
            // storing admin
            bookingViewAll.admin = admins.Items[i];

            // getting all the companies of provided admin
            const companies = await db.query({
                TableName: process.env.COMPANY_TABLE,
                IndexName: "adminId-index",
                KeyConditionExpression: "adminId = :a",
                ExpressionAttributeValues: {
                    ":a": admins.Items[i].id
                }
            }).promise();

            // getting all the services of the companies
            for (let i = 0; i < companies.Items.length; i++) {
                const response = await db.query({
                    TableName: process.env.BOOKING_TABLE,
                    IndexName: "booking-companyId-index",
                    KeyConditionExpression: "companyId = :a",
                    ExpressionAttributeValues: {
                        ":a": companies.Items[i].id
                    }
                }).promise();
                // variable for storing data for a specific company of admin
                const bookingView = {};
                bookingView.company = companies.Items[i];
                bookingView.bookings = response.Items;
                // pushing company &&services data to array
                bookingViewList.push(bookingView);
            }
            // storing all the companies && services of an admin
            bookingViewAll.bookingview = bookingViewList;
            // storing all admins with companies && services
            bookingViewAllList.push(bookingViewAll);
        }
        // if there are no admins, companies or services empty array will be returned
        return callback(null, bookingViewAllList);

    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminBookingViewAll = adminBookingViewAll;