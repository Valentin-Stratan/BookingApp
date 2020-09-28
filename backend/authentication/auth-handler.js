'use strict';
const adminList = require('./adminList');
const adminLogin = require('./adminLogin');
const adminRegister = require('./adminRegister');
const adminPasswordRecover = require('./adminPasswordRecover');
const adminPasswordConfirm = require('./adminPasswordConfirm');
const adminReset = require('./adminResetPassword');

module.exports.authController = async (event, context, callback) => {
    switch (event.field) {
        case 'adminRegister': {
            await adminRegister.adminRegister(event, context, callback);
            break;
        }
        case 'adminList': {
            await adminList.adminList(event, context, callback);
            break;
        }
        case 'adminLogin': {
            await adminLogin.adminLogin(event, context, callback);
            break;
        }
        case 'adminPasswordRecover': {
            await adminPasswordRecover.adminPasswordRecover(event, context, callback);
            break;
        }
        case 'adminPasswordConfirm': {
            await adminPasswordConfirm.adminPasswordConfirm(event, context, callback);
            break;
        }
        case 'adminResetPassword': {
            await adminReset.adminResetPassword(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};