'use strict';

const 
express = require('express'),
request = require('request'),
Receive = require('./services/receive'),
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
app.post('/webhook', (req, res) => {
    let body = req.body;
    console.log(body.entry[0].messaging);
    // Checks if this is an event from a page subscription
    if (body.object === 'page') {
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
        
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {            
            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0            
            let webhookEvent = entry.messaging[0];
            console.log(JSON.stringify(webhookEvent.message));

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
                        let referral;
                        if (webhookEvent.hasOwnProperty('postback') && webhookEvent.postback.hasOwnProperty('referral')) {
                            referral = true;
                        } else {
                            referral = false;
                        }
                        let receivedMessage = new Receive(users[senderPsid], webhookEvent, referral);
                        return receivedMessage.handleMessage();
                    });
            } else {
                i18n.setLocale(users[senderPsid]. locale);
                console.log('El perfil ya existe, PSID:', senderPsid, 'con locale:', i18n.getLocale());
                let referral;
                if (webhookEvent.hasOwnProperty('postback') && webhookEvent.postback.hasOwnProperty('referral')) {
                    referral = true;
                } else {
                    referral = false;
                }
                let receivedMessage = new Receive(users[senderPsid], webhookEvent, referral);
                return receivedMessage.handleMessage();
            }            
        });                
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
    });
    

    //Set up your App's Messenger Profile
    app.get('/profile', (req, res) => {
        let token = req.query["verify_token"];
        let mode = req.query['mode'];

        if (!config.webhookUrl.startsWith('https://')) {
            res.status(200).send('Error - se necesita una API_URL segura en el archivo .env');
        }
        let Profile = require('./services/mProfile');
        Profile = new Profile();

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            if (token === config.verifyToken) {
                if (mode === 'profile' || mode === 'all') {
                    Profile.setThread();
                    res.write(`<p>Configurando el perfil de messenger de la página ${config.pageId}</p>`);
                }
                if (mode === 'domains' || mode === 'all') {
                    Profile.setWhitelistedDomains();
                    res.write(`<p>Dominios permitidos: ${config.setWhitelistedDomains}</p>`);
                }
                res.status(200).end();
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        } else {
            // Returns a '404 Not Found' if mode or token are missing
            res.sendStatus(404);
        }

    });
        
    module.exports = app;