const
    express = require('express'),
    {urlencoded, json}= require('body-parser');
    router = express.Router();

    // router.use(urlencoded({extended: true}));

    // router.use(json({verify: verifyRequestSignature}));

    router.route('/').get((req, res) => res.send('GET request to homepage'));

    router.use(require('../msg/messenger'));

    module.exports = router;