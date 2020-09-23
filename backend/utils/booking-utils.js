const utils = require('./utils');
module.exports = {
    validateEmail: function validateEmail(email) {
        return (!email ? false : (!utils.mailFormat.test(email) ? false : true));
    },
    validatePhone: function validatePhone(phone) {
       return (!phone ? false : (phone.length > 16 ? false : true));
    },
    validateName: function validateName(name) {
        return (!name ? false : (name.length > 40 ? false : true));
    }
}