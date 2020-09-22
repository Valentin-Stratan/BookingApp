const pngMime = 'iVBORw0KGgo';
const base64Format  = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

module.exports = {
    validateName: function validateName(name) {
        if (!name) return false;
        else return true;
    },
    validateDescription: function validateDescription(description) {
        if (!description) return false;
        else return true;
    },

    logoMimeTypes: pngMime,
    base64Format: base64Format
    
}