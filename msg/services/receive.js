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
        let 
            event = this.webhookEvent,
            responses,
            dato;

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
                responses = this.handlePostback();
                if ((responses.length - 1) === typeof 'string') {
                    dato = responses.pop();
                }
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
        return dato;
    }

    // Handles messages events with text
    handleTextMessage() {
        console.log(`Texto recibido: "${this.webhookEvent.message.text}" de ${this.user.psid}`);

        let message = this.webhookEvent.message.text.trim().toLowerCase();

        let response;

        if (message.includes('empezar de nuevo') || message.includes('otra vez')) {
            response = Response.genNuxMessage(this.user);
            response.push(Datos.servicios());
        } else {
            response = Response.genAskEmail()
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
            response = Response.genNuxMessage(this.user);
            response.push(Datos.servicios());
        } else if (payload === 'EMPRENDEDOR') {
            response = [
                Response.genText(i18n.__('datos.emprendedor')),
                Response.genText(i18n.__('datos.etapa')),
                Datos.etapa(),
                'Emprendimiento Digital'
            ];
        } else if (payload === 'TRANSF') {
            response = [
                Response.genText(i18n.__('datos.transf')),
                Response.genText(i18n.__('datos.situacion')),
                Datos.transf(),
                'Transformación Digital'
            ];
        } else if (payload === 'DISENO') {
            response = [
                Response.genText(i18n.__('datos.diseno')),
                Response.genText(i18n.__('datos.desarrollo')),
                Datos.diseno(),
                'Diseño Web'
            ];
        } else if (payload === 'ET1' || payload === 'ET2' || payload === 'ET3' ||
                   payload === 'TR1' || payload === 'TR2' || payload === 'TR3' ||
                   payload === 'DN1' || payload === 'DN2' || payload === 'DN3'
        ) {
            response = [
                Response.genText(i18n.__('datos.confirmacion', { user_first_name: this.user.firstName})),
                Response.genText(i18n.__('datos.proyecto'))
            ];
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