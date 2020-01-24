'use strict';

// Dependencies
const  
    express = require('express'),
    path = require('path'),
    port = 1337,
    app = express();
    
const EventEmitter = require('events');

module.exports = new EventEmitter();

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Parse application/json
app.use(express.json());

// Set server port and log message on console
app.listen(process.env.PORT || port, () => console.log(`Webhook is listening in ${port}`));

// Default get request
app.get('/', (req, res) => {
    res.send('GET request to homepage');
});

// Get request for base url
app.post('/webhook', (req,res) => {
    let body = req.body;

    // Checks if this is an event from a page subscription
    if (body.object === 'page') {
       
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0

            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "0rGmKRRcJXxLOgL"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge)
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403); 
        }
    }

});