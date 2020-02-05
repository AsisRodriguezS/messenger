'use strict';

const i18n = require('../idiomas/i18n.config');

module.exports = class Response {
    static genQuickReply(text, quickReplies, tipo) {
        let response = {
            text: text,
            quick_replies: []
        };
        if (tipo === 'texto') {
            for (let quickReply of quickReplies) {
                response['quick_replies'].push({
                    content_type: 'text',
                    title: quickReply['title'],
                    payload: quickReply['payload']
                });
            }
        } else if (tipo === 'email') {
            for (let quickReply of quickReplies) {
                if (quickReply['content_type'] === 'user_email') {
                    response['quick_replies'].push({
                    content_type: quickReply['content_type'],
                    });                    
                } else {
                    response['quick_replies'].push({
                    content_type: quickReply['text'],
                    title: quickReply['title'],
                    payload: quickReply['payload']
                    });  
                }
            }
        }

        console.log(response[0], response[1]);
        return response;
    }

    static genText(text) {
        let response = {
            text: text
        };

        return response;
    }

    static genAskEmail () {
        let email = this.genQuickReply(i18n.__('datos.email'), [
            {
                content_type: 'user_email'
            },
            {
                content_type: 'text',
                title: i18n.__('datos.neg'),
                payload: 'MAS_TARDE'
            }
        ], 'email');

        return email;
    }

    static genNuxMessage(user) {
        let welcome = this.genText(
            i18n.__('get_started.welcome', {
                user_first_name: user.firstName
            })
            );

        let guide = this.genQuickReply(i18n.__('get_started.guidance'), [
            {
                title: i18n.__('menu.emprendedor'),
                payload: 'EMPRENDEDOR'
            },
            {
                title: i18n.__('menu.empresario'),
                payload: 'EMPRESARIO'
            }
        ], 'texto');

            return [welcome, guide];
    }
}