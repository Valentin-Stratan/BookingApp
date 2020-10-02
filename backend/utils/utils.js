const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const AWS = require('aws-sdk');
const SES = new AWS.SES();
const filterWords = ['mere', 'pointless', 'wtf'];


module.exports = {
    mailFormat: mailFormat,
    
    newError: function newError(errorMessage) {
        let error = new Error;
        error.message = errorMessage;
        return error;
    },

    sendMail: async function sendMail(toEmail, body, subject) {
        const params = {
            Destination: {
                ToAddresses: [toEmail]
            },
            Message: {
                Body: {
                    // text represents the body message with all data
                    Text: { Data: body} 
                },
                // subject represents the subject of sent email
                Subject: { Data: subject}
            },
            // Email that we are sending from
            Source: process.env.ADMIN_EMAIL
        }

        await SES.sendEmail(params).promise();
    },

    objIsEmpty: function objIsEmpty(obj) {
        for(let key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    censor: function censor(string, filters) {
        // "i" is to ignore case and "g" for global "|" for OR match
        var regex = new RegExp(filters.join("|"), "gi");
        return string.replace(regex, function (match) {
            //replace each letter with a star
            var stars = '';
            for (var i = 0; i < match.length; i++) {
                stars += '*';
            }
            return stars;
        });
    },
    
    filterWords: filterWords
}