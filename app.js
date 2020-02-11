'use strict';

// Dependencies
const  
    express = require('express'),
    path = require('path'),
    exhbs = require('express-handlebars'),
    port = 1337,
    app = express();
    
// const EventEmitter = require('events');

// module.exports = new EventEmitter();

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Parse application/json
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exhbs());
app.set('view engine', 'handlebars');

// Set server port and log message on console
app.listen(process.env.PORT || port, () => console.log(`Webhook is listening in ${port}`));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/routes'));