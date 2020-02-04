'use strict';

const  
    GraphAPI = require('./graph-api'),
    i18n = require('../idiomas/i18n.config'),
    config = require('./config'),
    locales = i18n.getLocales();

    module.exports = class Profile {

        setThread() {
            let profilePayload = {
                ...this.getGetStarted(),
                ...this.getGreeting()
            }

            GraphAPI.callMessengerProfileAPI(profilePayload);
        }

        setWhitelistedDomains() {
            let domainPayload = this.getWhitelistedDomains();
            GraphAPI.callMessengerProfileAPI(domainPayload);
        }

        getGetStarted() {
            return {
                get_started: {
                    payload: GET_STARTED
                }
            };
        }

        getGreeting() {
            let greetings = [];

            for (let locale of locales) {
                greetings.push(this.getGreetingText(locale));
            }

            return {
                greeting: greetings
            };
        }

        getGreetingText(locale) {
            let param = locale === 'es_LA' ? 'default': locale;

            i18n.setLocale(locale)

            let localizedGreeting = {
                locale: param,
                text: i18n.__('profile.greeting', { user_first_name: '{{user_first_name}}'
                })
            }
            console.log(localizedGreeting);
            return localizedGreeting;
        }

        getWhitelistedDomains() {
            let getWhitelistedDomains = {
                whitelisted_domains: config.whitelistedDomains
            };

            console.log(whitelistedDomains);
            return whitelistedDomains;
        }


    }
