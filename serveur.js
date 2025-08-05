require('dotenv').config;

const fs = require('fs');
const http = require('http');
const https = require('https');

const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);


const cors = require('cors');
const morgan = require('morgan');
const path = require("path");

const privateKey  = fs.readFileSync(path.join(__dirname,'./config/sslcert/server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname,'./config/sslcert/server.crt'), 'utf8');

const credentials = {key: privateKey, cert: certificate};

const GLOBAL = require("./service/Global");
//Auth
const passport = require('./config/passport');
const cookieParser = require('cookie-parser');


const serveur = express();
const port = process.env.PORT || 8080;

serveur.use(morgan('dev'));
serveur.use(cors({credentials: true, origin: true}));

serveur.use(express.json());
serveur.use('/public/files', express.static(path.join(__dirname, '/public/files')));

serveur.use('/', express.static(path.join(__dirname, '/../frontend-pointage/dist')));
//serveur.use('/dashboard', express.static(path.join(__dirname, "/../digigolf-client/dist/digigolf-client")));

//serveur.listen(port, '0.0.0.0', () => console.log('Serveur démarré sur le port: '+ port));
var httpServer = http.createServer(serveur);
var httpsServer = https.createServer(credentials, serveur);

httpServer.listen(8080);
httpsServer.listen(3000);

require(__dirname + '/config/db.js')(serveur);

serveur.use(cookieParser());
serveur.use(session({
    secret: 'dArSalaMus2021minus-maximus+',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: serveur.settings.mongoose.connection,
        collection: 'session',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 60 * 24,
    },
}))

serveur.use(passport.initialize());
serveur.use(passport.session());
require(__dirname + '/service/RouterHandler')(serveur);


serveur.use('/*', express.static(path.join(__dirname, '/../frontend-pointage/dist')));