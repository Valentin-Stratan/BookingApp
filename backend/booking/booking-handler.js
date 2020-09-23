'use strict';
const create = require('./publicBookingCreate');

module.exports.bookingController = async (event, context, callback) => {
    switch (event.field) {
        case 'publicBookingCreate': {
            await create.publicBookingCreate(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
        
    }
};