const path = require('path'),
    fs = require('fs'),
    utils = require('../utils'),
    cgi = require('./cgi'),
    direct = require('./direct'),
    config = global.config;

module.exports = function(app) {
    // config文件交互
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

    // 针对被排除的接口（文件上传下载）的处理是直接透传不做任何处理
    for (let i = 0, len = config.ignoreList.length; i < len; i++) {
        app.all(config.ignoreList[i], function(req, res) {
            utils.routeToServer(req, res);
        });
    }

    // 需要代理到其他特殊目标地址的请求
    for (let k in config.proxyTable) {
        app.all(k, function (req, res) {
            // 将目标地址挂载到req上
            req.targetUrl = config.proxyTable[k] + req.path;

            direct(req, res, function(err, data, response) {
                if (err) {
                    console.log('request ' + req.url + ' error');
                    console.log(err);
                    res.send(err);
                    return;
                }
                if (response.headers['set-cookie']) {
                    res.set('set-cookie', response.headers['set-cookie']);
                }

                res.send(data);

                return false;
            });
        });
    }

    app.get('/', function(req, res, next) {
        res.redirect('/index.html');
    });

    // 接口请求
    for (let j = 0, le = config.monitoringList.length; j < le; j++) {
        app.all(config.monitoringList[j], cgi);
    }

    // 请求的是html时，将目标服务器选择面板挂载上
    app.get('*.html', function(req, res, next) {
        var p = req.path;
        if (config.env === 'dev') {
            p = p.replace(/^\/activity\//, '/');
        }
        if (global.frame === 'fis3') {
            res._originC = fs.readFileSync(path.resolve(global.proPath, p.slice(1)), {
                encoding: "utf8"
            });
        }

        var data =  utils.renderHTML(res._originC);

        if (data) {
            res.send(data);
        } else {
            next();
        }
    });
};
