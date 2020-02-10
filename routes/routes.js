const
    express = require('express'),
    {urlencoded, json}= require('body-parser');
    router = express.Router();

    // router.use(urlencoded({extended: true}));

    // router.use(json({verify: verifyRequestSignature}));

    router.route('/').get((req, res) => res.render('pages/home.handlebars'));
    router.route('/images').get((req, res) => res.render('pages/images.handlebars'));
    router.route('/images/servicio').get((req, res) => res.render('pages/images/servicio.handlebars'));

    router.use(require('../msg/messenger'));

    module.exports = router;