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
                            'TRANSF'
                        ),
                        Response.genPostbackButton(
                            i18n.__('menu.diseno'),
                            'DISENO'
                        )
                    ]
                );
            return response;
        }

        static etapa() {
            let response = 
            Response.genGenericTemplate(
                `${config.appUrl}/img/msn/emprendimiento_digital.jpg`,
                i18n.__('datos.titulo'),
                i18n.__('datos.subtituloE'),
                [
                    Response.genPostbackButton(
                        i18n.__('menu.et1'),
                        'ET1'
                    ),
                    Response.genPostbackButton(
                        i18n.__('menu.et2'),
                        'ET2'
                    ),
                    Response.genPostbackButton(
                        i18n.__('menu.et3'),
                        'ET3'
                    )
                ]
            );
            return response;
        }

        static transf() {
            let response = 
            Response.genGenericTemplate(
                `${config.appUrl}/img/msn/transformacion_digital.jpg`,
                i18n.__('datos.titulo'),
                i18n.__('datos.subtituloT'),
                [
                    Response.genPostbackButton(
                        i18n.__('menu.tr1'),
                        'TR1'
                    ),
                    Response.genPostbackButton(
                        i18n.__('menu.tr2'),
                        'TR2'
                    ),
                    Response.genPostbackButton(
                        i18n.__('menu.tr3'),
                        'TR3'
                    )
                ]
            );
            return response;
        }
    }
