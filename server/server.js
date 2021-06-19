const PORT = process.env.PORT || 3000;

// initialize libraries
const express = require('express');
const session = require('express-session')
const handlebars = require('express-handlebars');
const sessionRoutes = require('./routes/session-route');
const usersRoutes = require('./routes/users-route');

// initialize handlebars
var hbs = handlebars.create({
    helpers: {
        formatPurpose: function(purposeName, version) {
            if (purposeName == 'ibm-oauth-scope') {
                return 'OAuth Scope';
            }

            return `${purposeName} (Version ${version})`
        },
        formatDate: function (badDate) {
            var dMod = new Date(badDate * 1000);
            return dMod.toLocaleDateString();
        },
        formatState: function (state) {
            var stateOpt = {
                1: "Consent allow",
                2: "Consent deny",
                3: "Opt-in",
                4: "Opt-out",
                5: "Transparent"
            }
            return stateOpt[state];
        },
        formatAccessType: function (accessType) {
            if (accessType == "default") {
                return "";
            }
            return accessType;
        },
        formatAttribute: function (attribute) {
            if (attribute == "") {
                return "–";
            }
            else {
                return attribute;
            }
        },
        'json': function(context) {
            return JSON.stringify(context);
        },
        'concat': function(str, suffix) {
            if (typeof str === 'string' && typeof suffix === 'string') {
                return str + suffix;
            }
            return str;
        },
    },
    layoutsDir: __dirname + '/../views/layouts',
    partialsDir: __dirname + '/../views/partials',
    extname: 'hbs',
    defaultLayout: 'default',
});

// initialize the app
const app = express();
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine)

app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: { path: '/', maxAge: 120 * 1000, secure: false }
}))

// define routes
app.use(express.static(__dirname + '/../public'))
app.use('/', sessionRoutes);
app.use('/users', usersRoutes);

app.listen(PORT, () => {
    console.log('Server started and listening on port 3000');
});