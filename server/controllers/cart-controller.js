const jwt = require('jsonwebtoken')
const OAuthController = require('./oauth-controller');
const Privacy = require('verify-dpcm-sdk-js');
const config = require('./config').Config;

class PrivacyController {

    constructor() {}

    getUserPayload = (req) => {
        let authToken = OAuthController.getAuthToken(req);
        let decoded = jwt.decode(authToken.id_token);
        return decoded;
    }

    assess = async (req, res) => {
        if (!OAuthController.isLoggedIn(req)) {
            res.redirect('/');
            return;
        }

        let idTokenPayload = this.getUserPayload(req);
        let auth = {
            accessToken: OAuthController.getAuthToken(req).access_token
        }

        let privacy = new Privacy(config, auth, {})
        // assess if the item can be used
        let items = [
            {
                "purposeId": "shipping",
                "attributeId": "home_address",
                "accessTypeId": "default"
            },
            {
                "purposeId": "shipping",
                "attributeId": "email",
                "accessTypeId": "default"
            }
        ]

        console.log(`Assessment request:\n${JSON.stringify(items, null, 2)}`);
        let decision = await privacy.assess(items);
        console.log(`Assessment response:\n${JSON.stringify(decision, null, 2)}`);
        if (decision.status == "consent") {
            // filter the list based on those that can be consented
            let items = [];
            for (const assess of decision.assessment) {
                for (const iaresult of assess.result) {
                    const attrId = (assess.attributeId) ? assess.attributeId : iaresult.attributeId;
                    const assessLog = `${assess.purposeId},${attrId},${assess.accessTypeId},${JSON.stringify(iaresult)}`;
                    if (!iaresult.requiresConsent) {
                        console.log(`Requires no consent: `, assessLog)
                        continue;
                    }
        
                    console.log(`Requires consent: ${assessLog}`)
                    items.push({
                        purposeId: assess.purposeId,
                        attributeId: attrId,
                        accessTypeId: assess.accessTypeId
                    })
                }
            }

            // metadata used to render a user consent page
            console.log(`Metadata request:\n${JSON.stringify(items, null, 2)}`);
            let r = await privacy.getConsentMetadata(items);
            console.log(`Metadata response:\n${JSON.stringify(r, null, 2)}`);
            for (let record of r.metadata.default) {
                let message = await this._buildConsentMessage(record);
                record.id = record.purposeId + record.attributeId + record.accessTypeId;
                record.message = message;
            }

            let fullJson = {
                decision: decision,
                metadata: r
            }
            res.render('consentPrompt', { user: idTokenPayload, consents: r.metadata.default,
                title: "Consent request", fullJson: JSON.stringify(fullJson, null, 4) });
        } else if (decision.status == "approved") {
            console.log("No action needed. Everything is approved");
            res.render('cart', { user: idTokenPayload, statusMessage: 'Go forth and purchase', title: "Buy stuff", fullJson: JSON.stringify(decision, null, 4) });
        } else if (decision.status == "denied" || decision.status == "multistatus") {
            console.log("None or some of the requested items are permitted for use.");
            res.render('cart', { user: idTokenPayload, statusMessage: 'Consent not given.', title: "Sorry", fullJson: JSON.stringify(decision, null, 4) });
        } else if (decision.status == "error") {
            console.log(`Something catastrophic happened\nJSON.stringify(decision.error, null, 2)`);
            res.render('cart', { user: idTokenPayload, statusMessage: 'Something blew up.', title: "Sorry", fullJson: JSON.stringify(decision, null, 4) });
        }
    }

    storeConsents = async (req, res) => {

        if (!OAuthController.isLoggedIn(req)) {
            res.redirect('/');
            return;
        }

        let idTokenPayload = this.getUserPayload(req);
        let auth = {
            accessToken: OAuthController.getAuthToken(req).access_token
        }

        let privacy = new Privacy(config, auth, {})

        console.log(`Store consents:\n${JSON.stringify(req.body, null, 2)}`);
        // assuming the request.body is a JSON array of 
        // consent records that need to be stored
        let r = await privacy.storeConsents(req.body);
        console.log(`Store consents response:\n${JSON.stringify(r, null, 2)}`);
        res.redirect('/users/cart');
    }

    _buildConsentMessage = async (record) => {
        let str = "Allow";
        if (record.accessTypeId != "default") {
            str += ` ${record.accessType} access`;
        } else {
            str += " access";
        }

        if (record.attributeId != null) {
            str += ` to my ${record.attributeName}`;    
        }

        str += ` for ${record.purposeName}`;

        return str;
    }
}

module.exports = PrivacyController;