'use strict';

const 
express = require('express'),
request = require('request'),
GraphAPI = require('./services/graph-api'),
config = require('./services/config'),
User = require('./services/user'),
i18n = require('./idiomas/i18n.config'),
app = express();
// request = require('request'),
// VERIFY_TOKEN = process.env.VERIFY_TOKEN,
// PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let users = {};

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {        
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === config.verifyToken) {            
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge)
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403); 
        }
    }    
});

// Creates the endpoint for your webhook
app.post('/webhook', (req,res) => {
    let body = req.body;
    
    // Checks if this is an event from a page subscription
    if (body.object === 'page') {
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
        
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {            
            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0            
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent.message);

            // Get the sender PSID
            let senderPsid = webhookEvent.sender.id;

            // Si el usuario no esta en users, crea uno nuevo
            if(!(senderPsid in users)) {
                let user = new User(senderPsid);
                console.log('Psid:', senderPsid);

                GraphAPI.getUserProfile(senderPsid)
                    .then(userProfile => {
                        user.setProfile(userProfile);
                    })
                    .catch(error => {
                        // Perfil no disponible
                        console.log('El perfil no está disponible:', error);
                    })
                    .finally(() => {
                        users[senderPsid] = user;
                        i18n.setLocale(user.locale);
                        console.log('Nuevo Perfil PSID:', senderPsid, 'con locale:', i18n.getLocale());
                    });
            } else {
                i18n.setLocale(users[senderPsid]. locale);
                console.log('El perfil ya existe, PSID:', senderPsid, 'con locale:', i18n.getLocale());
            }


            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);        
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
  }
            
        });
                
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
    });
    
    
    // Handles messages events
    function handleMessage(senderPsid, receivedMessage) {
        let response;

        // Check if the message contains text
        if (receivedMessage.text) {
            
            // Create the payload for a basic text message
            response = {
                "text": `Mensaje "${receivedMessage.text}" recibido`
            }
        }

        // Sends the response message
        callSendAPI(senderPsid, response);
    }

    // Sends response messages via the Send API
    function callSendAPI(senderPsid, response) {
        // Construct the message body
        let requestBody = {
            "recipient":  {
                "id": senderPsid
            },
            "message": response
        }

        // Send the HTTP request to the Messenger Platform
        request({
            "uri": "https://graph.facebook.com/v5.0/me/messages",
            "qs": { "access_token": config.pageAccessToken },
            "method": "POST",
            "json": requestBody
        }, (err, res, body) => {
            if (!err) {
                console.log('Mensaje enviado');
            } else {
                console.error('No se pudo enviar el mensaje:' + err);
            }
        });
    }
    
    module.exports = app;