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
                        content_type: 'user_email'
                    });                    
                } else {
                    response['quick_replies'].push({
                        content_type: 'text',
                        title: quickReply['title'],
                        payload: quickReply['payload']
                    });  
                }
            }
        } else if (tipo === 'tel') {
            for (let quickReply of quickReplies) {
                if (quickReply['content_type'] === 'user_phone_number') {
                    response['quick_replies'].push({
                        content_type: 'user_phone_number'
                    }); 
                } else {
                    response['quick_replies'].push({
                        content_type: 'text',
                        title: quickReply['title'],
                        payload: quickReply['payload']
                    }); 
                }
            }
        }
        return response;
    }

    static genText(text) {
        let response = {
            text: text
        };

        return response;
    }

    static genAskEtapa () {
        let etapa = this.genQuickReply(i18n.__('datos.etapa'), [
            {
                title: i18n.__('menu.et1'),
                payload: 'ET1'
            },
            {
                title: i18n.__('menu.et2'),
                payload: 'ET2'
            },
            {
                title: i18n.__('menu.et3'),
                payload: 'ET3'
            },
        ], 'texto')

        return etapa;
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

    static genAskPhone(payload) {
        let tel = this.genQuickReply(payload.includes('@') ?
        i18n.__('datos.tel1') : i18n.__('datos.tel2'), [
            {
                content_type: 'user_phone_number'
            },
            {
                content_type: 'text',
                title: i18n.__('datos.neg'),
                payload: 'MAS_TARDE2'
            }
        ], 'tel');

        return tel;
    }

    static genGenericTemplate(image_url, title, subtitle, buttons) {
        let response = {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [
                {
                  title: title,
                  subtitle: subtitle,
                  image_url: image_url,
                  buttons: buttons
                }
              ]
            }
          }
        };
    
        return response;
    }

    static genButtonTemplate(title, buttons) {
        let response = {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: title,
              buttons: buttons
            }
          }
        };
    
        return response;
    }

    static genPostbackButton(title, payload) {
        let response = {
          type: "postback",
          title: title,
          payload: payload
        };
    
        return response;
    }

    static genWebUrlButton(title, url) {
        let response = {
          type: "web_url",
          title: title,
          url: url,
          messenger_extensions: true
        };
    
        return response;
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
                title: i18n.__('menu.transf'),
                payload: 'TRANSF'
            },
            {
                title: i18n.__('menu.diseno'),
                payload: 'DISENO'
            }
        ], 'texto');

            return [welcome, guide];
    }

    static urlButton (text, title, url) {
        let response = {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: text,
                buttons: [
                  {
                    type: "web_url",
                    url,
                    title,
                    webview_height_ratio: "full"
                  }
                ]
              }
            }
        }
        return response;
    }
}
