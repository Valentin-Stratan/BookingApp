const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

module.exports = {
    mailFormat: mailFormat,
    
    newError: function newError(errorMessage) {
        let error = new Error;
        error.message = errorMessage;
        return error;
    }
}