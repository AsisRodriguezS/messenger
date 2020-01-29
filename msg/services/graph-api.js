'use strict';

const   
    request = require('request'),
    camelCase = require('camelcase'),
    config = require('./config');

module.exports = class GraphAPI {

    // Send the HTTP request to the Messenger Platform
    static callSendAPI(requestBody) {
        request({
            uri: `${config.mPlatfom}/me/messages`,
            qs: { access_token: config.pageAccessToken },
            method: 'POST',
            json: requestBody
        }, err => {
            if (!err) {
                console.log('Mensaje enviado');
            } else {
                console.error('No se pudo enviar el mensaje:' + err);
            }
        });
    }

    // Send the HTTP request to the Messenger Profile API
    static callMessengerProfileAPI(requestBody) {
        console.log(`Configurando el Messenger Profile para la App ${config.appId}`);
        request({
            uri: `${config.mPlatfom}/me/messenger_profile`,
            qs: { access_token: config.pageAccessToken },
            method: 'POST',
            json: requestBody
        }, (err, res, body) => {
            if (!err) {
                console.log('Petición enviada:', + body);
            } else {
                console.error('No se pudo enviar el mensaje:' + err);
            }
        });
    }
}