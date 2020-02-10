const
    express = require('express'),
    {urlencoded, json}= require('body-parser');
    router = express.Router();

    // router.use(urlencoded({extended: true}));

    // router.use(json({verify: verifyRequestSignature}));

    router.route('/').get((req, res) => res.render('pages/home.handlebars'));
    router.route('/images').get((req, res) => res.render('pages/images.handlebars'));
    router.route('/images/servicio').get((req, res) => res.render('pages/servicio.handlebars'));
    router.route('/images/emprendimiento').get((req, res) => res.render('pages/emprendimiento.handlebars'));

    router.use(require('../msg/messenger'));

    module.exports = router;