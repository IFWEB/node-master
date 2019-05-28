const path = require('path'),
    fs = require("fs"),
    main = require('../tpl/main'),
    direct = require('./direct'),
    utils = require('../utils'),
    config = global.config,
    mockPath = path.resolve(process.cwd(), '../', 'data');

module.exports = (req, res, next) => {
    let query = req.method.toLowerCase() === 'get' ? req.query : req.body,
        fileDir = path.resolve(mockPath, req.path.slice(1)),
        mainFile = path.resolve(fileDir, 'main.js'),
        jsonFile,
        data;

    if (typeof query.pageNum !== 'undefined' || typeof query.pageNo !== 'undefined') {
        jsonFile = `${fileDir}/page_${query.pageNum || query.pageNo}.json`;
    } else {
        jsonFile = `${fileDir}/data.json`;
    }

    switch (config.mode) {
        case 'localdata':
            if (fs.existsSync(fileDir)) {
                if (fs.existsSync(jsonFile)) {
                    data = main(req, config.mode);
                } else {
                    data = utils.buildCgiData(jsonFile);
                }
            } else {
                utils.buildDir(jsonFile);
                data = utils.buildCgiData(jsonFile);
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

                //本地录制
                if (config.copyDataToLocal) {
                    if (!fs.existsSync(fileDir)) {
                        utils.buildDir(mainFile);
                    }

                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 4), {
                        'encoding': 'utf8'
                    });
                }
                return false;
            });

            break;
    }
};
