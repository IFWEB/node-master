var http = require('http'),
    path = require('path'),

    request = require('request-ssl-nfd'),

    hps = require('../helpers'),
    config = require('../config'),
    handleCgi = require('./cgi');


/*request.addFingerprint('m.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');
request.addFingerprint('www.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');
*/

module.exports = function(app) {
    if (false) {
        //所有请求透传到服务器
        app.all('*', function(req, res) {
            hps.routeToServer(req, res);
        });
    }

    app.get('/_master_', function(req, res) {
        var msg = req.query.config;

        try {
            msg = JSON.parse(msg);
        } catch (e) {
            msg = {};
            console.log('返回 config 格式不正确！');
        }

        for (var x in msg) {
            config[x] = msg[x];
        }

        res.end();

    });
    //针对被排除的接口的处理是直接透传不做任何处理
    for (var i = 0, len = config.ignoreList.length; i < len; i++) {
        app.all(config.ignoreList[i], function(req, res) {
            hps.routeToServer(req, res);
        });
    }
    //接口请求
    app.all('*.htm', handleCgi);

    app.get('/', function(req, res, next) {
        res.redirect('/index.html');
    });

    app.get('*.html', function(req, res, next) {
        var filePath, data = '';

        if (config.env === 'dev') {
            filePath = path.resolve(global.proDevPath, req.path.slice(1));
        } else {
            filePath = path.resolve(global.proDistPath, req.path.slice(1));
        }

        data = hps.renderHTML(filePath);

        if (data) {
            res.send(data);
        } else {
            next();
        }
    });
};