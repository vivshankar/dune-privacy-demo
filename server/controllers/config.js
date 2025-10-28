// load contents of .env into process.env
require('dotenv').config();

exports.Config = {
    tenantUrl    : process.env.TENANT_URL,
    discoveryUrl : process.env.DISCOVERY_URL,
    clientId     : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri  : process.env.REDIRECT_URI,
    scope        : process.env.SCOPE,
    signupLink   : process.env.USER_REGISTRATION_LINK,
    themeId      : process.env.THEME_ID,
};