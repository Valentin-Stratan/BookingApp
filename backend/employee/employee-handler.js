'use strict';
const create = require('./adminEmployeeCreate');
const update = require('./adminEmployeeUpdate');
const publicView = require('./publicEmployeeView');
const adminView = require('./adminEmployeeView');
const remove = require('./adminEmployeeDelete');

module.exports.employeeController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminEmployeeCreate': {
            await create.adminEmployeeCreate(event, context, callback);
            break;
        }
        case 'adminEmployeeUpdate': {
            await update.adminEmployeeUpdate(event, context, callback);
            break;
        }
        case 'publicEmployeeView': {
            await publicView.publicEmployeeView(event, context, callback);
            break;
        }
        case 'adminEmployeeView': {
            await adminView.adminEmployeeView(event, context, callback);
            break;
        }
        case 'adminEmployeeDelete': {
            await remove.adminEmployeeDelete(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};