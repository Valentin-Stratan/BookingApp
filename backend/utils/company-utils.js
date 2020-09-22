const pngMime = 'iVBORw0KGgo';
const base64Format = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

module.exports = {
    validateName: function validateName(name) {
        if (!name) return false;
        else return true;
    },
    validateDescription: function validateDescription(description) {
        if (!description) return false;
        else return true;
    },

    dynamicallyValidateName: function dynamicallyValidateName(name) {
        if (!name) return true;
        else return true;
    },
    dynamicallyValidateDescription: function dynamicallyValidateDescription(description) {
        if (!description) return true;
        else return true;
    },

    getKeyIndex: function getKeyIndex(url) {
        let length = url.length, i = -1;
        let n = 3;
        while (n-- && i++ < length) {
            i = url.indexOf('/', i);
            if (i < 0) break;
        }
        return i;
    },
    logoMimeTypes: pngMime,
    base64Format: base64Format

}