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

    static async getUserProfile(senderPsid) {
        try {
          const userProfile = await this.callUserProfileAPI(senderPsid);
    
          for (const key in userProfile) {
            const camelizedKey = camelCase(key);
            const value = userProfile[key];
            delete userProfile[key];
            userProfile[camelizedKey] = value;
          }
    
          return userProfile;
        } catch (err) {
          console.log("Fetch failed:", err);
        }
    }

    static callUserProfileAPI(senderPsid) {
        return new Promise(function(resolve, reject) {
          let body = [];
    
          // Send the HTTP request to the Graph API
          request({
            uri:`${config.mPlatfom}/${senderPsid}`,
            qs: {
              access_token: config.pageAccessToken,
              fields: 'first_name, last_name, gender, locale, timezone'
            }
          })
            .on("response", function(response) {
              // console.log(response.statusCode);
    
              if (response.statusCode !== 200) {
                reject(Error(response.statusCode));
              }
            })
            .on("data", function(chunk) {
              body.push(chunk);
            })
            .on("error", function(error) {
              console.error("Unable to fetch profile:" + error);
              reject(Error("Network Error"));
            })
            .on("end", () => {
              body = Buffer.concat(body).toString();
              console.log(JSON.parse(body));
    
              resolve(JSON.parse(body));
            });
        });
      }
}