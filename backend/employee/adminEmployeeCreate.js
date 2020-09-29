'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');

const eUtils = require('../utils/employee-utils');

require('dotenv').config(); 

async function adminEmployeeCreate(event, context, callback) {
    try {
        const request = event.arguments;
        const profileImageData = request.profile_image;

        // validate provided service ID
        const service = await db.get({
            TableName: process.env.SERVICE_TABLE,
            Key: {
                id: request.serviceId
            }
        }).promise();

        if(!service.Item)
            return callback(utils.newError('Service with provided ID not found'), null);

        // validate first name
        if(!eUtils.validateFirstname(request.first_name))
            return callback(utils.newError('Invalid first name'), null);
        // validate last name
        if(!eUtils.validateLastname(request.last_name))
            return callback(utils.newError('Invalid last name'), null);
        
        // validate profile image
        // check if image is base64 encoded
        if (!eUtils.base64Format.test(profileImageData))
            return callback(utils.newError('Image have to be base64 encoded!!'), null);
        // check if base64 image have apropriate mime type(png)
        if (!profileImageData.includes(eUtils.imageMimeTypes)) {
            return callback(utils.newError('Wrong image mime type'), null);
        }
        
        // validate working hours
        if(!eUtils.validateStartTime(request.start_time))
            return callback(utils.newError('Invalid start time'), null);
        if(!eUtils.validateFinishTime(request.finish_time, request.start_time, service.Item.duration))
            return callback(utils.newError('Invalid finish time'), null);
         
        
        // save profile image to s3
        // creating the buffer to create an s3 object
        const buffer = Buffer.from(profileImageData, 'base64');

        // get the mime-type from base64 image
        const mimeType = 'image/png';

        // create name of file stored in S3
        const name = uuid.v4();
        const key = `${service.Item.companyId}/${name}.png`;
        
        await S3.putObject({
            Body: buffer,
            Key: key,
            ContentType: mimeType,
            Bucket: process.env.PROFILE_BUCKET,
            ACL: 'public-read'
        }).promise();

        const profileUrl = `https://${process.env.PROFILE_BUCKET}.s3-eu-central-1.amazonaws.com/${key}`;

        const employee = {
            id: uuid.v4(),
            first_name: request.first_name,
            last_name: request.last_name,
            serviceId: request.serviceId,
            companyId: service.Item.companyId,
            start_time: request.start_time,
            finish_time: request.finish_time,
            profile_image: profileUrl
        }

        const response = await db.put({
            TableName: process.env.EMPLOYEE_TABLE,
            Item: employee
        }).promise();

        if(response) {
            return callback(null, employee);
        }
        else {
            return callback(utils.newError('Unable to create employee'), null);
        } 
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminEmployeeCreate = adminEmployeeCreate;