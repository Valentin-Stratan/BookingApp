'use strict';
const create = require('./adminEmployeeCreate');

module.exports.employeeController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminEmployeeCreate': {
            await create.adminEmployeeCreate(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};