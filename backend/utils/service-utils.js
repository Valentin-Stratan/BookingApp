const durationFormat = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;

module.exports = {
    validateName: function validateName(name) {
        if (!name) return false;
        else return true;
    },
    validateDescription: function validateDescription(description) {
        if (!description) return false;
        else return true;
    },
    validateDuration: function validateDuration(duration) {
        if (!duration) {
            return false;
        }
        else {
            let isValid = durationFormat.test(duration);
            if(!isValid) {
                return false
            }
            else {
                let hours = parseInt(duration.slice(0, 2));
                let minutes = parseInt(duration.slice(3, 5));
                if((hours > 8) || (hours === 8 && minutes > 0)) {
                    return false;
                }
                else return true;
            }
        }
    },
    validateSpaces: function validateSpaces(spaces) {
        if (!spaces) return false;
        else if (typeof spaces != "number") return false;
        else return true;
    },
    validatePrice: function validatePrice(price) {
        if (!price) return false;
        else if (typeof price != "number") return false;
        else return true;
    },
    dynamicallyValidateDuration: function dynamicallyValidateDuration(duration) {
        if (!duration) {
            return true;
        }
        else {
            let isValid = durationFormat.test(duration);
            if(!isValid) {
                return false
            }
            else {
                let hours = parseInt(duration.slice(0, 2));
                let minutes = parseInt(duration.slice(3, 5));
                if((hours > 8) || (hours === 8 && minutes > 0)) {
                    return false;
                }
                else return true;
            }
        }
    },
    dynamicallyValidateSpaces: function dynamicallyValidateSpaces(spaces) {
        if (!spaces) return true;
        else if (typeof spaces != "number") return false;
        else return true;
    },
    dynamicallyValidatePrice: function dynamicallyValidatePrice(price) {
        if (!price) return true;
        else if (typeof price != "number") return false;
        else return true;
    },

}