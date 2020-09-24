'use strict';
const create = require('./publicBookingCreate');
const view = require('./adminBookingView');
const viewAll = require('./adminBookingViewAll');
const remove = require('./publicBookingDelete');

module.exports.bookingController = async (event, context, callback) => {
    switch (event.field) {
        case 'publicBookingCreate': {
            await create.publicBookingCreate(event, context, callback);
            break;
        }
        case 'adminBookingView': {
            await view.adminBookingView(event, context, callback);
            break;
        }
        case 'adminBookingViewAll': {
            await viewAll.adminBookingViewAll(event, context, callback);
            break;
        }
        case 'publicBookingDelete': {
            await remove.publicBookingDelete(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
        
    }
};