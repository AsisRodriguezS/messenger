const
    express = require('express'),
    {urlencoded, json}= require('body-parser');
    router = express.Router();

    app.use(urlencoded({extended: true}));

    app.use(json({verify: verifyRequestSignature}));

    router.use(require('../msg/messenger'));

    module.exports = router;