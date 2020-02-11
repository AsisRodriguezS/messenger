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

        static servicios () {
            let response = 
                Response.genGenericTemplate(
                    `${config.appUrl}/img/msn/tipodeservicio.png`,
                    i18n.__('datos.titulo'),
                    i18n.__('datos.subtitulo'),
                    [
                        Response.genPostbackButton(
                            i18n.__('menu.emprendedor'),
                            'EMPRENDEDOR'
                        ),
                        Response.genPostbackButton(
                            i18n.__('menu.transf'),
                            'TRANS'
                        ),
                        Response.genPostbackButton(
                            i18n.__('menu.diseno'),
                            'DISENO'
                        )
                    ]
                );
            return response;
        }
    }
