'use strict';
const create = require('./adminServiceCreate');
const update = require('./adminServiceUpdate');

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
        case 'adminViewAllService': {
            break;
        }
        case 'adminDeleteService': {
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};