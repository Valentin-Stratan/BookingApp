'use strict';
const create = require('./adminCompanyCreate');
const view = require('./adminCompanyView');

const remove = require('./adminCompanyDelete');

module.exports.companyController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminCompanyCreate': {
            await create.adminCompanyCreate(event, context, callback);
            break;
        }
        case 'adminCompanyView': {
            await view.adminCompanyView(event, context, callback);
            break;
        }
        



        case 'adminCompanyDelete': {
            await remove.adminCompanyDelete(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};