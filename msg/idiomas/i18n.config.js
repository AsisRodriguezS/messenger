const
    i18n = require('i18n');

i18n.configure({
    defaultLocale: 'es_LA',
    directory: __dirname + '/locales',
    objectNotation: true,
    api: {
        __: 'translate',
        __n: 'translateN'
    }
});

module.exports = i18n;