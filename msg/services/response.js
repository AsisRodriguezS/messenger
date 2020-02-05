'use strict';

const i18n = require('../idiomas/i18n.config');

module.exports = class Response {
    static genQuickReply(text, quickReplies) {
        let response = {
            text: text,
            quick_replies: []
        };

        for (let quickReply of quickReplies) {
            response['quick_replies'].push({
                content_type: 'text',
                title: quickReply['title'],
                payload: quickReply['payload']
            });
        }

        return response;
    }

    static genText(text) {
        let response = {
            text: text
        };
    }

    static genNuxMessage(user) {
        let welcome = this.genText(
            i18n.__('get_started.welcome', {
                user_first_name: user.firstName
            })
            );
        console.log(`Welcome: ${welcome}`);

        let guide = this.genText(i18n.__('get_started.guidance'), [
            {
                title: i18n.__('menu.emprendedor'),
                payload: 'EMPRENDEDOR'
            },
            {
                title: i18n.__('menu.empresario'),
                payload: 'EMPRESARIO'
            }
        ]);

            return [welcome, guide]
    }
}