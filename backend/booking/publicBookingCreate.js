'use strict';
const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
const { validateBooking, sendConfirmation } = require('../utils/booking-utils');
require('dotenv').config();

async function publicBookingCreate(event, context, callback) {
    try {
        const request = event.arguments;
        // Validations
        // check if serviceId exists
        const service = await db.get({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            }
        }).promise();

        if (!service.Item)
            return callback(utils.newError('Service with provided ID not found'), null);

        // validate client email
        if (!bUtils.validateEmail(request.clientEmail))
            return callback(utils.newError('Invalid email'), null);
        // validate client phone
        if (!bUtils.validatePhone(request.clientPhone))
            return callback(utils.newError('Invalid phone number'), null);
        // validate client name
        if (!bUtils.validateName(request.clientName))
            return callback(utils.newError('Invalid name'), null);

        // creating params for booking
        // format mm dd yyyy hour:minute
        const date = new Date(request.slot);
        const newBookingId = uuid.v4();
        const params = {
            TableName: process.env.BOOKING_TABLE,
            Item: {
                id: newBookingId,
                employeeId: request.employeeId,
                serviceId: request.serviceId,
                slot: date.toString(),
                clientName: request.clientName,
                clientEmail: request.clientEmail,
                clientPhone: request.clientPhone,
                companyId: service.Item.companyId
            }
        }

        // If an employee were provided, validate him and create a booking assigned to him 
        if (request.employeeId) {
            // validate requested employee
            const employee = await db.get({
                TableName: process.env.EMPLOYEE_TABLE,
                Key: {
                    id: request.employeeId
                }
            }).promise();

            if (!employee.Item)
                return callback(utils.newError('Company with provided ID not found'), null);

            // query all existing bookings of provided employee so when can check his availability for new booking
            const employeeBookings = await db.query({
                TableName: process.env.BOOKING_TABLE,
                IndexName: 'employeeId-index',
                KeyConditionExpression: 'employeeId = :a',
                ExpressionAttributeValues: {
                    ':a': request.employeeId
                }
            }).promise();

            // If employee have bookings check availability
            // Iterate through all his bookings and check if new booking can be registered
            if (employeeBookings.Items.length > 0) {
                if (bUtils.validateBooking(employee.Item, request.slot, employeeBookings.Items, service.Item)) {
                    // create the booking in db if validations were passed
                    await db.put(params).promise();
                    await bUtils.sendConfirmation(employee.Item.email ,params.Item.clientEmail, params.Item.id);
                    return callback(null, `Booking created successfully on date: ${date}`);
                }
                return callback(utils.newError('Cant be booked'), null);
            }
            // if employee don't have any bookings we can create one without validating availability
            else {
                // create the booking in db
                await db.put(params).promise();
                await bUtils.sendConfirmation(employee.Item.email ,params.Item.clientEmail, params.Item.id);
                return callback(null, `Booking created successfully on date: ${date}`);
            }
        }
        // If user didn't provide any employee at booking, need to pick a random employee available for requested booking
        else {
            // query all employees of provided service so we can check their availability
            const employees = await db.query({
                TableName: process.env.EMPLOYEE_TABLE,
                IndexName: 'serviceId-index',
                KeyConditionExpression: 'serviceId = :a',
                ExpressionAttributeValues: {
                    ':a': request.serviceId
                }
            }).promise();

            if (employees.Items.length === 0)
                return callback(utils.newError("This service don't have employees"), null);

            // Iterate through employee array and make needed validations
            for (let i = 0; i < employees.Items.length; i++) {
                // get the employee data
                const employee = await db.get({
                    TableName: process.env.EMPLOYEE_TABLE,
                    Key: {
                        id: employees.Items[i].id
                    }
                }).promise();

                // query all existing bookings of employee
                const employeeBookings = await db.query({
                    TableName: process.env.BOOKING_TABLE,
                    IndexName: 'employeeId-index',
                    KeyConditionExpression: 'employeeId = :a',
                    ExpressionAttributeValues: {
                        ':a': employee.Item.id
                    }
                }).promise();

                // If employee have bookings check availability
                // Iterate through all his bookings and check if new booking can be registered
                if (employeeBookings.Items.length > 0) {
                    if (bUtils.validateBooking(employee.Item, request.slot, employeeBookings.Items, service.Item)) {
                        params.Item.employeeId = employee.Item.id;
                        await db.put(params).promise();
                        await bUtils.sendConfirmation(employee.Item.email ,params.Item.clientEmail, params.Item.id);
                        return callback(null, `Booking created successfully on date: ${date}`);
                    }
                }
                // if employee don't have any bookings we can create one without validating availability
                else {
                    params.Item.employeeId = employee.Item.id;
                    await db.put(params).promise();
                    await bUtils.sendConfirmation(employee.Item.email ,params.Item.clientEmail, params.Item.id);
                    return callback(null, `Booking created successfully on date: ${date}`);
                }
            }
        }
        // return error if there are no employees available for requested booking
        return callback(utils.newError('Unable to create bookings'), null);
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicBookingCreate = publicBookingCreate;