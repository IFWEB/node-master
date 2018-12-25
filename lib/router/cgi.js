
var path = require('path'),
    fs = require("fs"),

    direct = require('./direct'),
    hps = require('../helpers'),
    config = global.config,

    mockPath = path.resolve(process.cwd(), '..', 'data');
module.exports = function(req, res, next) {
    var query = req.method.toLowerCase() === 'get' ? req.query : req.body,
        fileDir = path.resolve(mockPath, req.path.slice(1)),
        mainFile = path.resolve(fileDir, 'main.js'),
        mockjsFile = path.resolve(fileDir, 'mock.json'),
        jsonFile,
        data;

    if (typeof query.page !== 'undefined') {
        jsonFile = fileDir + '/page_' + query.page + '.json';
    } else {
        jsonFile = fileDir + '/data.json';
    }

    switch (config.mode) {
        case 'localdata':
            if (fs.existsSync(mainFile)) {
                if (fs.existsSync(jsonFile)) {
                    data = require(mainFile)(query, config.mode);
                } else {
                    data = hps.buildCgiData(jsonFile);
                }
            } else {
                if (!fs.existsSync(fileDir)) {
                    hps.buildDir(mainFile);
                }

                hps.buildCgiMainJS(mainFile);
                data = hps.buildCgiData(jsonFile);
            }
            res.send(data);
            break;
        case 'serverdata':
            //媒体文件目前没有本地保存，本地保存的都是json数据等
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

                if (config.copyDataToLocal) {

                    //本地录制
                    if (!fs.existsSync(fileDir)) {
                        hps.buildDir(mainFile);
                    }

                    if (!fs.existsSync(mainFile)) {
                        hps.buildCgiMainJS(mainFile);
                    }

                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    fs.writeFile(jsonFile, JSON.stringify(data, null, 4), {
                        'encoding': 'utf8'
                    });
                }
                return false;
            });

            break;
    }
};
