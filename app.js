'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
let cfenv = require('cfenv');
let serveStatic = require('serve-static');

let Parser = require('odata-v4-parser').Parser;
let parser = new Parser();

// create express instance
let oApp = express();

// Cloud Foundry environment variables
let oAppEnv = cfenv.getAppEnv();

// "static" resources 
//oApp.use(express.static(__dirname + '/client/public/webapp'));

// connect to mongodb
require('./server/db/mongo-connect.js')(oAppEnv);

// client express routes
//require('./client/routes/routes.js')(oApp);

// body parser middleware to handle URL parameter and JSON bodies
oApp.use(bodyParser.urlencoded({ extended: false }));
oApp.use(bodyParser.json());

oApp.post('/odata/\\$batch', jsonParser, function (req, res, next) {
    res.status(400);
    next('Not implemented');
});

let ServiceMetadata = require('odata-v4-service-metadata').ServiceMetadata;

oApp.get('/odata/\\$metadata', ServiceMetadata.defineEntities({
    namespace: 'Default',
    containerName: 'Container',
    entities: [
        {
            name: 'User',
            collectionName: 'Users',
            keys: ['Id'],
            computedKey: true,
            properties: {
                Id: 'Edm.String',
                user_name: 'Edm.String',
                last_name: 'Edm.Int32',
                first_name: 'Edm.Int32'
            },
            annotations: [
                { name: 'UI.DisplayName', value: 'Test' },
                { property: 'Id', name: 'UI.ReadOnly', value: 'true' },
                { property: 'Title', name: 'UI.DisplayName', value: 'Test test' },
            ]
        }
    ]
}).requestHandler());

// api
require('./server/api/users/users.js')(oApp);

// express app listener
oApp.listen(oAppEnv.port, function () {
    console.log('Server listening at ' + oAppEnv.url);
});

// app.use(serveStatic(path.join(__dirname, './public')));
// app.listen(52999);
