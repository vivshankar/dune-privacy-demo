const config = require('./config').Config;
const Issuer = require('openid-client').Issuer
const { uuid } = require('uuidv4');

class OAuthController {

    constructor(scope) {
        this._scope = scope;
    }

    authorize = async (req, res) => {
        this._oidcIssuer = await Issuer.discover(config.discoveryUrl);
        console.log('Discovered issuer %s %O', this._oidcIssuer.issuer, this._oidcIssuer.metadata);

        this._client = new this._oidcIssuer.Client({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uris: [config.redirectUri],
            response_types: ['code'],
            token_endpoint_auth_method: 'client_secret_post'
        });
    
        let url = this._client.authorizationUrl({
            scope: this._scope,
            state: uuid(),
        });

        console.log(`Authorize URL: ${url}`)

        res.redirect(url)
    }

    aznCallback = async (req, res) => {

        const params = this._client.callbackParams(req);
        var clientAssertionPayload = null
        const tokenSet = await this._client.callback(config.redirectUri, params, {
            state: params.state
        }, {
            clientAssertionPayload: clientAssertionPayload,
        });
        console.log(`received and validated tokens\n${JSON.stringify(tokenSet, null, 2)}\n`);

        req.session.authToken = tokenSet;
        req.session.token = tokenSet;
        req.session.save();

        // Extract redirect URL from querystring
        let targetUrl = req.session.targetUrl;
        if (!targetUrl || targetUrl == "") {
            targetUrl = "/";
        }

        // redirect to authenticated page
        res.redirect(targetUrl);
    }

    logout = (req, res) => {

        if (!OAuthController.isLoggedIn(req)) {
            res.redirect('/')
            return;
        }

        req.session.destroy();
        const proxyHost = req.headers["x-forwarded-host"];
        const host = proxyHost ? proxyHost : req.headers.host;
        res.redirect(config.tenantUrl + '/idaas/mtfim/sps/idaas/logout?redirectUrl=' + encodeURIComponent(req.protocol + '://' + host) + "&themeId=" + config.themeId);
    }

    static isLoggedIn(req) {
        return req.session != null && req.session.authToken != null && req.session.authToken != "";
    }

    static getAuthToken = (req) => {
        if (req.session) {
            return req.session.authToken
        }
    
        return null;
    }
}

module.exports = OAuthController;