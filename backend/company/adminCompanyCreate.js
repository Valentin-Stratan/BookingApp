'use strict';

'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const uuid = require('uuid');
const utils = require('../utils/utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminCompanyCreate(event, context, callback) {
    try {
        const request = event.arguments;
        const logoData = event.arguments.logo;
        if (!cUtils.validateName(request.name))
            return callback(utils.newError('Invalid name'), null);
        if (!cUtils.validateDescription(request.description))
            return callback(utils.newError('Invalid description'), null);
        // validate admin id
        const admin = await db.get({
            TableName: process.env.ADMINS_TABLE,
            Key: {
                id: request.adminId
            }
        }).promise();
        if(!admin)
            return callback(utils.newError('Admin with provided ID not found!!!'), null);
        // check if logo is base64 encoded
        if(!cUtils.base64Format.test(logoData))
            return callback(utils.newError('Logo have to be base64 encoded!!'), null);
        // check if base64 image have apropriate mime type(png)
        if(!logoData.includes(cUtils.logoMimeTypes)) {
            return callback(utils.newError('Wrong logo mime type'), null);
        }

        // creating the buffer to create an s3 object
        const buffer = Buffer.from(logoData, 'base64');

        // get the mime-type from base64 image
        const mimeType = 'image/png';

        // create name of file stored in S3
        let name = uuid.v4();
        const companyId = uuid.v4();
        const key = `${companyId}/${name}.png`;
        

        await S3.putObject({
            Body: buffer,
            Key: key,
            ContentType: mimeType,
            Bucket: process.env.LOGO_BUCKET,
            ACL: 'public-read'
        }).promise();

        const logoUrl = `https://${process.env.LOGO_BUCKET}.s3-eu-central-1.amazonaws.com/${key}`;

        const company = {
            id: companyId,
            name: request.name,
            description: request.description,
            adminId: request.adminId,
            logo: logoUrl
        }
        // creating the entry in db
        const response = await db.put({
            TableName: process.env.COMPANY_TABLE,
            Item: company
        }).promise();
        // check if service was creating and returning a response
        if (response) {
            return callback(null, company);
        }
        else {
            return callback(utils.newError('Unable to create the company'), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminCompanyCreate = adminCompanyCreate;