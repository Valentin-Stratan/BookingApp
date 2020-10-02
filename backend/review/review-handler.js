'use strict';
const create = require('./publicReviewCreate');

module.exports.reviewController = async (event, context, callback) => {
    switch (event.field) {
        case 'publicReviewCreate': {
            await create.publicReviewCreate(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};