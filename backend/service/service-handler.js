'use strict';
const create = require('./adminServiceCreate');

module.exports.serviceController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminServiceCreate': {
            await create.adminServiceCreate(event, context, callback);
            break;
        }
        case 'adminUpdateService': {
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