'use strict';
const create = require('./adminServiceCreate');
const update = require('./adminServiceUpdate');
const remove = require('./adminServiceDelete');
const view = require('./adminServiceViewAll');

module.exports.serviceController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminServiceCreate': {
            await create.adminServiceCreate(event, context, callback);
            break;
        }
        case 'adminServiceUpdate': {
            await update.adminServiceUpdate(event, context, callback);
            break;
        }
        case 'adminServiceViewAll': {
            await view.adminServiceViewAll(event, context, callback);
            break;
        }
        case 'adminServiceDelete': {
            await remove.adminServiceDelete(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};