const
    Response = require('./response'),
    GraphAPI = require('./graph-api'),
    config = require('./config'),
    Datos = require('./datos'),
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
                    responses = this.handleTextMessage();
                }
            } else if (event.postback) {
                console.log('Oh no');
                responses = this.handlePostback();
            } else if (event.referral) {
                console.log('Oh si');
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
        console.log(`Texto recibido: "${this.webhookEvent.message.text}" de ${this.user.psid}`);

        let message = this.webhookEvent.message.text.trim().toLowerCase();

        let response;

        if (message.includes('empezar de nuevo') || message.includes('otra vez')) {
            response = [];
            response = response.push(Response.genNuxMessage(this.user));
            response = response.push(Datos.servicios());
        } //else {
        //     response = [
        //         Response.genText(i18n.__('fallback.any', {
        //             message: this.webhookEvent.message.text
        //         })
        //         ),
        //         Response.genQuickReply(i18n.__('get_started.guidance'), [
        //             {
        //                 title: i18n.__('menu.emprendedor'),
        //                 payload: 'EMPRENDEDOR'
        //             },
        //             {
        //                 title: i18n.__('menu.empresario'),
        //                 payload: 'EMPRESARIO'
        //             }
        //         ])                   
        //     ];
        // }

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
        // Postback con referral del m.me link (get started con referral o página de Yoinn.mx)
        let payload;
        if (postback.referral && postback.referral.ref === 'CHAT-PLUGIN') {
            payload = postback.referral.ref;
        } else {
            // Get the payload of the postback
            payload = postback.payload;
        }
        return this.handlePayload(payload.toUpperCase());
    }

    handleReferral() {
        // Get the payload of the postback
        let payload = this.webhookEvent.referral.ref.toUpperCase();

        return this.handlePayload(payload);
    }

    handlePayload(payload) {

 
        let response;
        if (payload === 'GET_STARTED') {
            response = [];
            response = response.push(Response.genNuxMessage(this.user));
            response = response.push(Datos.servicios());

        } else if (payload === 'EMPRENDEDOR' || payload === 'TRANSF' || payload === 'DISENO') {
            response = Response.genAskEtapa();
        } else if (payload === 'ET1' || payload === 'ET2' || payload === 'ET3'){ 
            response = Response.genAskEmail();
        } else if (payload.includes('@') || payload === 'MAS_TARDE') {
            response = Response.genAskPhone(payload);
        } else if (payload.includes('+') || Number(payload) || payload === 'MAS_TARDE2') {
            response = [];
            response.push(Response.genText(i18n.__('despedida.pronto', { user_first_name: this.user.firstName})));
            response.push(Response.genText(i18n.__('despedida.pagina')));
            response.push(Response.urlButton(i18n.__('despedida.texto'), i18n.__('despedida.boton'), config.appUrl));
            
        } else if (payload.includes('CHAT-PLUGIN')) {
            response = [
                Response.genText(i18n.__('chat_plugin.prompt', { user_first_name: this.user.firstName})),
                Response.genText(i18n.__('get_started.guidance')),
                Datos.servicios()
            ];
        } else {
        response = {
            text: `¡Este es un mensaje por defecto para el payload: ${payload}!`
        };
    }

    return response;
    }

    handleAttachmentMessage() {
        let response;

        // Get the attachment
        let attachment = this.webhookEvent.message.attachments[0];
        if (!(this.webhookEvent.message.sticker_id && this.webhookEvent.message.sticker_id == '369239263222822')) {
            console.log('Se recibió archivo adjunto:', `${attachment} de ${this.user.psid}`);        
            response = Response.genText(i18n.__('fallback.attachment'));
        } else {
            response = Response.genText('¡Saludos!');
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