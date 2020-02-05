const
    Response = require('./response'),
    GraphAPI = require('./graph-api'),
    i18n = require('../idiomas/i18n.config');

module.exports = class Receive {
    constructor(user, webhookEvent) {
        this.user = user;
        this.webhookEvent = webhookEvent;
    }

    // Check if the Event is a message or postback and
    // call the appropriate handler function
    handleMessage() {
        let event = this.webhookEvent;

        let responses;

        try {
            if (event.message) {
                let message = event.message;

                if (message.quick_reply) {
                    responses = this.handleQuickReply();
                } else if (message.attachments) {
                    responses = this.handleAttachmentMessage();
                } else if (message.text) {
                    this.handleTextMessage();
                }
            } else if (event.postback) {
                responses = this.handlePostback();
            } else if (event.referral) {
                responses = this.handleReferral();
            }
        } catch(error) {
            console.log(error);
            responses = {
                text: `Ha ocurrido un error: '${error}'. Hemos sido notificados y \
                solucionaremos el problema a la brevedad.`
            };
        }

        if (Array.isArray(responses)) {
            let delay = 0;
            for (let response of responses) {
                this.sendMessage(response, delay * 2000);
                delay++;
            }
        } else {
            this.sendMessage(responses);
        }
    }

    // Handles messages events with text
    handleTextMessage() {
        console.log(`Texto recibido: ${this.webhookEvent.message.text} de ${this.user.psid}`);

        let message = this.webhookEvent.message.text.trim().toLowerCase();

        let response;
        
        if (message.includes('empezar de nuevo') || message.includes('otra vez')) {
            response = Response.genNuxMessage(this.user);
        } else {
            response = [
                Response.genText(i18n.__('fallback.any', {
                    message: this.webhookEvent.message.text
                })
                ),
                Response.genText(i18n.__('get_started.guidance'), [
                    {
                        title: i18n.__('menu.emprendedor'),
                        payload: 'EMPRENDEDOR'
                    },
                    {
                        title: i18n.__('menu.empresario'),
                        payload: 'EMPRESARIO'
                    }
                ])                   
            ];
        }

        return response;
    }

    // Handles message events with quick replies
    handleQuickReply() {
        // Get the payload of the Quick Reply
        let payload = this.webhookEvent.message.quick_reply.payload;

        return this.handlePayload(payload);
    }

    // Handles postback events
    handlePostback() {
        let postback = this.webhookEvent.postback;
        // Check for the special Get Starded with referral
        let payload;
        if (postback.referral && postback.referral.type == 'OPEN_THREAD') {
            payload = postback.referral.ref;
        } else {
            // Get the payload of the postback
            payload = postback.payload;
        }
        return this.handlePayload(payload.toUpperCase());
    }

    handlePayload(payload) {
        if (payload === 'GET_STARTED') {
            response = Response.genNuxMessage(this.user);
        } else {
        response = {
            text: `¡Este es un mensaje por defecto para el payloda: ${payload}!`
        };
    }

    return response;
    }

    sendMessage(response, delay = 0) {
        // Construct the message body

        let requestBody = {
            recipient: {
                id: this.user.psid
            },
            message: response
        };

        setTimeout(() => GraphAPI.callSendAPI(requestBody), delay);
    }
}