const
    express = require('express'),
    {urlencoded, json}= require('body-parser');
    router = express.Router();

    // router.use(urlencoded({extended: true}));

    // router.use(json({verify: verifyRequestSignature}));

    router.route('/').get((req, res) => res.render('pages/home.handlebars'));

    router.use(require('../msg/messenger'));

    module.exports = router;