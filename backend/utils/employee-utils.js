const timeFormat = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
const pngMime = 'iVBORw0KGgo';
const base64Format = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

module.exports = {
    validateFirstname: function validateFirstname(firstname) {
        return (!firstname ? false : (firstname.length > 20 ? false: true));
    },
    validateLastname: function validateLastname(lastname) {
        return (!lastname ? false : (lastname.length > 20 ? false: true));
    },
    validateStartTime: function validateStartTime(time) {
        if (!time) {
            return false;
        }
        else {
            let isValid = timeFormat.test(time);
            return (!isValid ? false : true);
        }
    },
    
    validateFinishTime: function validateFinishTime(time, startTime, serviceDuration) {
        if (!time) {
            return false;
        }
        else {
            let isValid = timeFormat.test(time);
            if(!isValid) {
                return false;
            }
            else {
                let hours = parseInt(time.slice(0, 2)); // finish time parsed hour
                let startHours = parseInt(startTime.slice(0, 2)); // start time parsed hour
                let durationHours = parseInt(serviceDuration.slice(0, 2)); // service duration time parsed hour
                if(startHours+durationHours <= hours) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }, 
    imageMimeTypes: pngMime,
    base64Format: base64Format
}