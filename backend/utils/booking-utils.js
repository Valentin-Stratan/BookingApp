const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

module.exports = {
    validateEmail: function validateEmail(email) {
        if (!email)
            return false;
        else {
            let isValid = mailFormat.test(email);
            if (!isValid)
                return false;
            else
                return true;
        }
    },
    validatePhone: function validatePhone(phone) {
        if(!phone)
            return false;
        else {
            if(phone.length > 16)
                return false;
            else 
                return true;
        }
    },
    validateName: function validateName(name) {
        if(!name)
            return false;
        else {
            if(name.length > 40)
                return false;
            else 
                return true;
        }
    }
}