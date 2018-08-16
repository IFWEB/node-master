var fs = require("fs"),
    path = require('path'),
    proxy = require('http-proxy').createProxyServer({}),

    config = require('./config'),

    pointHTML = fs.readFileSync(path.resolve(__dirname, './tpl/point.html'), {
        encoding: 'utf8'
    }),
    notFoundHTML = fs.readFileSync(path.resolve(__dirname, './tpl/404.html'), {
        encoding: 'utf8'
    });

//在接口所在文件夹下创建main.js
exports.buildCgiMainJS = function(filename, type) {
    var mainJSPath = path.resolve(__dirname, './tpl/main_' + (type ? type : 'simple') + '.js');

    var data = fs.readFileSync(mainJSPath, {
        encoding: 'utf8'
    });

    fs.writeFile(filename, data, function(err) {
        if (err) {
            console.log('build ' + filename + ' error: ' + err);
        }
        console.log('build ' + filename);
    });
};

//在接口所在的文件夹下创建数据文件
exports.buildCgiData = function (filename) {
	var data = {
		code: 123,
		message: '本地没有数据，请先执行数据录制'
	};

    fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log('build ' + filename + ' error: ' + err);
        };
        console.log('build ' + filename);
    });

    return data;
};

exports.buildMockjs = function(filename) {
    var data = {
        code: 123,
        message: 'mockjs 为空，请先填入模拟数据'
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
    return data;
};

//透传
exports.routeToServer = function(req, res) {
    var target = exports.generateURI();

    proxy.web(req, res, {
        target: target
    }, function(e) {
        if (e) {
            console.log(e);
        }
    });
};

exports.isJSONP = function(req) {
    return req.hostname === 'jsonp.ke.qq.com';
};

exports.buildDir = function(filename) {
    var fileDir = path.dirname(filename),
        arr = fileDir.split(/\/|\\/),
        baseDir = arr.shift();

    baseDir || (baseDir = '/');
    baseDir = baseDir.replace(/^\w:/, '/'); //高版本node不识别windows的盘符，盘符转化成根目录就可以

    for (var i = 0, len = arr.length; i <= len; i++) {
        if (fs.existsSync(baseDir)) {

            if (arr[i]) {
                baseDir = path.resolve(baseDir, arr[i]);
            }
            continue;
        } else {
            fs.mkdirSync(baseDir);

            if (arr[i]) {
                baseDir = path.resolve(baseDir, arr[i]);
            }
        }
    }
};

//处理html inline
exports.renderHTML = function(filePath) {
    var data = '',
        selfFn = arguments.callee;

    var configStr = JSON.stringify(config);

    newPointHTML = pointHTML.replace('{__master_config}', "'" + configStr + "'");

    //读取html文件
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, {
            encoding: "utf8"
        });

        data = data.replace(/(<body[^>]*>)/, '$1\n</script>')
            .replace(/(<\/body>)/, newPointHTML + '$1');
    }

    return data;
};

exports.render404 = function(info) {
    var configStr = JSON.stringify(config);

    newPointHTML = pointHTML.replace('{__master_config}', "'" + configStr + "'");

    return notFoundHTML.replace('{errorInfo}', info).replace(/(<\/body>)/, newPointHTML + '$1');
};

exports.generateURI = function(path) {
    var uri = '';
    //指定测试环境

    path || (path = '');

    if (config.mode === 'serverdata') {
        for (var i = 0, len = config.hosts.length; i < len; i++) {
            var host = config.hosts[i];

            if (host['selected']) {
                if (host['ip'] === '') {
                    //现网IP
                    if (global.selectedPro === 'pc') {
                        uri = 'https://www.lcfarm.com' + path;
                    } else if (global.selectedPro === 'h5' || global.selectedPro === 'activity') {
                        uri = 'https://m.lcfarm.com' + path;
                    }
                } else {
                    // if (/^\/api\//.test(path) || /^\/activity\//.test(path)) {
                    //     //以 /api/ 开头，新的api类型，单独服务部署，使用新的端口
                    //     //
                    //     console.log("****host['ip']***=" + host['ip']);
                    //     uri = "http://" + host['ip'] + ':' + (host.proxyPort['api'] || 8080) + path;

                    //     console.log("****uri***=" + uri);
                    // } else {
                    console.log("****host['ip']***=" + host['ip']);
                    console.log("****global.selectedPro***=" + global.selectedPro);
                    if (global.selectedPro === 'pc') {
                        uri = "http://" + host['ip'] + ':' + (host.proxyPort['pc'] || 8080) + path;
                    } else if (global.selectedPro === 'h5') {
                        uri = "http://" + host['ip'] + ':' + (host.proxyPort['h5'] || 8081) + path;
                    }

                    console.log("****uri***=" + uri);
                    // }
                }
                break;
            }
        }
    } else if (config.mode === 'yapidata') {
        if (global.selectedPro === 'pc') {
            uri = "http://" + config.yapi.ip + ':' + (config.yapi.proxyPort['pc'] || 80) + config.yapi.url['pc'] + path;
        } else if (global.selectedPro === 'h5' || global.selectedPro === 'activity') {
            uri = "http://" + config.yapi.ip + ':' + (config.yapi.proxyPort['h5'] || 80) + config.yapi.url['h5'] + path;
        }
    }

    return uri;
};


exports.jsonBody2Str = function(json) {
    var str = "";
    for (var p in json) {
        var value = json[p];

        value = encodeURIComponent(value);

        str += "&" + p + "=" + value;
    }
    return str.substr(1);
};