'use strict';

module.exports.adminSignup = async event => {
    console.log('Received event {}', JSON.stringify(event, 3));
  
      const consumerKey = event.arguments.consumer_key;
      const consumerSecret = event.arguments.consumer_secret;
  
      console.log('Got an Invoke Request.');
      switch (event.field) {
          case 'adminSignup': {
              callback(null, 'Cognito admin signup');
              break;
          }
          default: {
              callback(`Unknown field, unable to resolve ${event.field}`, null);
              break;
          }
      }
  };