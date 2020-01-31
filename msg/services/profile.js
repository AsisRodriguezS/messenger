'use strict';

const  
    GraphAPI = require('./graph-api'),
    i18n = require('../idiomas/i18n.config'),
    config = require('./config'),
    locales = i18n.getLocales();

    module.exports = class Profile {

        setThread() {
            let profilePayload = {
                ...this.getGetStarted()
            }

            GraphAPI.callMessengerProfileAPI(profilePayload);
        }

        setGetStarted
    }
