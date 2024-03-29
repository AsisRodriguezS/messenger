'use strict';

const
    express = require('express'),
    request = require('request'),
    Receive = require('./services/receive'),
    GraphAPI = require('./services/graph-api'),
    config = require('./services/config'),
    User = require('./services/user'),
    i18n = require('./idiomas/i18n.config'),
    mongoClient = require('mongodb').MongoClient,
    app = express();
// request = require('request'),
// VERIFY_TOKEN = process.env.VERIFY_TOKEN,
// PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let urlDB = 'mongodb://localhost:27017';
let users = {};

app.use(express.json({ verify: verifyRequestSignature }));

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
            // console.log(JSON.stringify(webhookEvent.message));

            // Get the sender PSID
            let senderPsid = webhookEvent.sender.id;

            // Si el usuario no esta en users, crea uno nuevo
            if (!(senderPsid in users)) {
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
                        let receivedMessage = new Receive(users[senderPsid], webhookEvent);
                        receivedMessage.handleMessage();
                    });
            } else {
                i18n.setLocale(users[senderPsid].locale);
                console.log('El perfil ya existe, PSID:', senderPsid, 'con locale:', i18n.getLocale());
                let dato;
                let receivedMessage = new Receive(users[senderPsid], webhookEvent);
                dato = receivedMessage.handleMessage();
                console.log(`El Dato es: ${dato}`);
                if (dato === 'Emprendimiento Digital' || dato === 'Transformación Digital' || dato === 'Diseño Web') {
                    users[senderPsid]['servicio'] = dato;
                } else if (dato === 'Idea' || dato === 'Modelo de Negocio' || dato === 'Capital semilla y/o primeras ventas' ||
                    dato === 'No tengo sistema' || dato === 'Mi sistema es insuficiente' || dato === 'Mi sistema es costoso' ||
                    dato === 'Landing Page' || dato === 'Tienda en Línea' || dato === 'Aplicación Web') {
                    users[senderPsid]['proyecto'] = dato;
                } else if (dato.includes('@') || dato === 'MAS_TARDE') {
                    users[senderPsid]['email'] = dato;
                } else if (dato.includes('+') || Number(dato) || dato === 'MAS_TARDE2') {
                    users[senderPsid]['tel'] = dato;

                    // Conexión a la base de datos de mongo e inserción del documento
                    try {
                        mongoClient.connect(urlDB, (err, db) => {
                            if (err) throw err;
                            let dbo = db.db('yoinnMx');
                            let myDoc = users[senderPsid];

                            dbo.collection('messengerLeads').insertOne(myDoc, (err, res) => {
                                if (err) throw err;
                                console.log('Se insertó un documento');
                                db.close();
                            })
                        })
                    } catch (err) {
                        console.dir(err);
                    }

                } else if (typeof dato === 'string') {
                    users[senderPsid]['nombreProyecto'] = dato;
                }
                console.log(users);
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

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        console.log("Couldn't validate the signature.");
    } else {
        var elements = signature.split("=");
        var signatureHash = elements[1];
        var expectedHash = crypto
            .createHmac("sha1", config.appSecret)
            .update(buf)
            .digest("hex");
        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

config.checkEnvVariables();

module.exports = app;