'use strict';
const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const bUtils = require('../utils/booking-utils');
require('dotenv').config();

async function publicBookingCreate(event, context, callback) {
    try {
        const request = event.arguments;
        // Validations
        // check if companyId exists
        const company = await db.get({
            TableName: process.env.COMPANY_TABLE,
            Key: {
                id: request.companyId
            }
        }).promise();

        if(!company.Item)
            return callback(utils.newError('Company with provided ID not found'), null);
        // check if serviceId exists
        const service = await db.get({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            }
        }).promise();

        if(!service.Item) 
            return callback(utils.newError('Service with provided ID not found'), null);

        // validate client email
        if(!bUtils.validateEmail(request.clientEmail))
            return callback(utils.newError('Invalid email'), null);
        // validate client phone
        if(!bUtils.validatePhone(request.clientPhone))
            return callback(utils.newError('Invalid phone number'), null);
        // validate client name
        if(!bUtils.validateName(request.clientName))
            return callback(utils.newError('Invalid name'), null);


        // format mm dd yyyy hour:minute
        const date = new Date(request.slot);
        const newBookingHour = date.getHours();
        const newBookingMinutes = date.getMinutes();
        // validate working hours 
        if(newBookingHour > 17 || newBookingHour < 8)
            return callback(utils.newError('Invalid booking time'), null);

        // check if there are free spaces at booked time
        // query all bookings of the requested service
        const bookings = await db.query({
            TableName: process.env.BOOKING_TABLE,
            IndexName: 'booking-serviceId-index',
            KeyConditionExpression: 'serviceId = :a',
            ExpressionAttributeValues: {
                ':a': request.serviceId
            }
        }).promise();

        // check all the busy spaces
        let busySpaces = 0;
        for(let i=0; i < bookings.Items.length; i++) {
            // get hour when service was booked
            const bookedServiceHour = new Date(bookings.Items[i].slot).getHours();
            // get minutes when service was booked
            const bookedServiceMinutes = new Date(bookings.Items[i].slot).getMinutes();
            // get duration of booked service
            const serviceDuration = parseInt(service.Item.duration.slice(0, 2));
            // check if booked service has same hour as the new booking
            if(bookedServiceHour === newBookingHour) {
                busySpaces++;
            }
            // check if booked service is between the new booking and -1 service duration
            // if yes, space of booked service will be unavailable for new booking
            if(bookedServiceHour < newBookingHour && bookedServiceHour === newBookingHour-serviceDuration) {
                if(bookedServiceMinutes > newBookingMinutes){    
                    busySpaces++;
                }
            }
            // check if booked service is between the new booking and +1 service duration
            // if yes, space of booked service will be unavailable for new booking
            if(bookedServiceHour === newBookingHour+serviceDuration) {
                //if(bookedServiceMinutes === newBookingMinutes || bookedServiceMinutes > newBookingMinutes){
                if(bookedServiceMinutes > newBookingMinutes){    
                    busySpaces++;
                }
            }
        }
        // compare busy spaces with total spaces, and return error if needed
        if(busySpaces === service.Item.spaces)
            return callback(utils.newError('All spaces are busy'), null);


        // create the booking in db
        const response = await db.put({
            TableName: process.env.BOOKING_TABLE,
            Item: {
                id: uuid.v4(),
                companyId: request.companyId,
                serviceId: request.serviceId,
                slot: date.toString(),
                clientName: request.clientName,
                clientEmail: request.clientEmail,
                clientPhone: request.clientPhone
            }
        }).promise();
        
        if(response)
            return callback(null, `Booking created successfully on date: ${date}`);
        else   
            return callback(utils.newError('Failed to create booking'), null);
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.publicBookingCreate = publicBookingCreate;