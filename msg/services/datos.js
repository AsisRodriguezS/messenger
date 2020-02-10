'use strict';

const 
    Response = require('./response'),
    config = require('./config'),
    i18n = require('../idiomas/i18n.config');

    module.exports = class Datos {
        constructor(user, webhookEvent) {
            this.user = user;
            this.webhookEvent = webhookEvent;
        }
    }
