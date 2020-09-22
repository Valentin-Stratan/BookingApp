'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const utils = require('../utils/utils');
const cUtils = require('../utils/company-utils');
require('dotenv').config();

async function adminCompanyDelete(event, context, callback) {
    try {
        return callback(null, 'Delete connected');
    }
    catch (error) {
        return callback(error, null);
    }
}

module.exports.adminCompanyDelete = adminCompanyDelete;