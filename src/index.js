require('dotenv').config('../.env');
require('./connection/db');

const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const path = require('path');
const https = require('https');
const i18n = require('./i18n/i18n');
const helmet = require('helmet');
const { logger } = require('./helpers/loggerService');
const morgan = require("morgan")
const { PORT, BASE_URL, ENVIRONMENT, DB_AUTH_URL, IS_SSL } = require('../config/key');
const rateLimit = require('express-rate-limit');

// Cors 
app.use(cors({ origin: '*' }));

app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));

// Parse request data to json
app.use(express.json());


// let server
// let serverSSl
try {
    if (IS_SSL == 'true') {
        const options = {
            key: ENVIRONMENT == "PROD" ? "PROD_CERTIFICATE_PATH" : fs.readFileSync('/var/www/ssl/multiqos.com.key'),
            cert: ENVIRONMENT == "PROD" ? "PROD_CERTIFICATE_PATH" : fs.readFileSync('/var/www/ssl/X509.crt')
        };
        if (ENVIRONMENT !== "PROD") options.ca = fs.readFileSync('/var/www/ssl/ca-bundle.crt')

        serverSSl = https.createServer(options, app);

        serverSSl.listen(PORT, () => {
            console.log('server listening on port:', PORT)
        })

    } else {
        console.log('No -----------IS_SSL')
        server = http.createServer(app)
        server.listen(PORT, () => {
            console.log('Server listening on port:', PORT)
        })
    }
} catch (err) {
    console.log('err(App.js)', err);
}

logger.debug('************************************************************************************************************************************');
logger.debug(`🚀⭐️  ENV: ${ENVIRONMENT}`);
logger.debug(`🚀⭐️  BASEURL: ${BASE_URL}`);
logger.debug(`🚀⭐️  PORT: ${PORT}`);
logger.debug(`🚀⭐️  MONGODB URL: ${DB_AUTH_URL}`);
logger.debug('************************************************************************************************************************************');

// Language file
app.use(i18n);


app.get('/', (req, res) => {
    res.send('Testing from the node service.');
});

// For security
// app.use(helmet());

// morgan.token('body', req => {
//     return JSON.stringify(req.body)
// })
// app.use(morgan(':method :url :body'))

// Api routes
// const commonRoute = require('./routes/common.routes');
logger.info('Loaded common routes');
app.use(commonRoute);

const publicDirectory = path.join(__dirname, '../');
app.use(express.static(publicDirectory))

app.use('*', (req, res, next) => {
    res.status(404).json({
        success: 'false',
        message: 'Page not found',
        error: {
            statusCode: 404,
            message: 'You reached a route that is not defined on this server',
        },
    });
})
