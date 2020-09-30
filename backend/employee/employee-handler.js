'use strict';
const create = require('./adminEmployeeCreate');
const update = require('./adminEmployeeUpdate');
const publicView = require('./publicEmployeeView');

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
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};