'use strict';

const ENV_VARS = [
    "PAGE_ID",
    "APP_ID",
    "PAGE_ACCESS_TOKEN",
    "APP_SECRET",
    "VERIFY_TOKEN",
    "APP_URL",
];

module.exports = {
    // Messenger Platform API
    mPlatformDomain: "https://graph.facebook.com",
    mPlatformVersion: "v6.0",

    // Page and Application information
    pageId: process.env.PAGE_ID,
    appId: process.env.APP_ID,
    pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
    appSecret: process.env.APP_SECRET,
    verifyToken: process.env.VERIFY_TOKEN,

    // URL of your app domain
    appUrl: process.env.APP_URL,

    // Preferred port (default to 3000)
    port: process.env.PORT || 3000,

    get mPlatfom() {
        return this.mPlatformDomain + "/" + this.mPlatformVersion;
    },

    // URL of your webhook endpoint
    get webhookUrl() {
        return this.appUrl + "/webhook";
    },
    
    get whitelistedDomains() {
        return [this.appUrl];
    },

    checkEnvVariables: function() {
        ENV_VARS.forEach(function(key) {
            if (!process.env[key]) {
                console.log("WARNING: Missing the environment variable " + key);
            } else {
                // Check that urls use https
                if (["APP_URL", "SHOP_URL"].includes(key)) {
                    const url = process.env[key];
                    if (!url.startsWith("https://")) {
                        console.log(
                            "WARNING: Your " + key + ' does not begin with "https://"'
                        );
                    }
                }
            }
        });
    }
}