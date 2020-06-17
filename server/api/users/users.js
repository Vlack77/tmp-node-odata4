'use strict';

module.exports = function (oApp) {

    let User = require('../../db/models/user.js');
    var createQuery = require('odata-v4-mongodb').createQuery;

    // service document
    oApp.get('/odata', function (req, res, next) {
        res.set('OData-Version', '4.0')
        res.json({
            '@odata.context': req.protocol + '://' + req.get('host') + '/odata/$metadata',
            value: [
                {
                    name: 'Users',
                    kind: 'EntitySet',
                    url: 'Users'
                }
            ]
        })
    });

    oApp.post('/odata/Users', jsonParser, function (req, res, next) {
        var entity = new User(req.body);
        entity.save().then(function (result) {
            if (req.headers.prefer && req.headers.prefer.indexOf('return=minimal') < 0) {
                res.status(201);
                res.json(result);
            } else {
                res.status(204);
                res.end();
            }
        }, next);
    });

    oApp.get('/odata/Users', function (req, res, next) {
        var find = {
            query: {},
            fields: {},
            options: {}
        };
        var qs = url.parse(req.url).query;
        if (qs) {
            var query = createQuery(qs);
            find.query = query.query;
            find.fields = query.projection;
            find.options.sort = query.sort;
            find.options.skip = query.skip;
            find.options.limit = query.limit;
        }

        User.find(find.query, find.fields, find.options, function (err, data) {
            if (err) return next(err);

            res.json({
                '@odata.context': req.protocol + '://' + req.get('host') + '/odata/$metadata#users',
                value: data
            });
        });
    });
};