'use strict';
const create = require('./publicReviewCreate');
const view = require('./publicReviewView');
const update = require('./publicReviewUpdate');
const remove = require('./publicReviewDelete');

module.exports.reviewController = async (event, context, callback) => {
    switch (event.field) {
        case 'publicReviewCreate': {
            await create.publicReviewCreate(event, context, callback);
            break;
        }
        case 'publicReviewView': {
            await view.publicReviewView(event, context, callback);
            break;
        }
        case 'publicReviewUpdate': {
            await update.publicReviewUpdate(event, context, callback);
            break;
        }
        case 'publicReviewDelete': {
            await remove.publicReviewDelete(event, context, callback);
            break;
        }
        default: {
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
        }
    }
};