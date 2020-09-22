'use strict';
const create = require('./adminCompanyCreate');

module.exports.companyController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminCompanyCreate': {
            await create.adminCompanyCreate(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};