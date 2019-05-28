let fs = require("fs"),
    path = require('path'),
    proxy = require('http-proxy').createProxyServer({}),
    config = global.config,
    pointHTML = fs.readFileSync(path.resolve(__dirname, './tpl/point.html'), {
        encoding: 'utf8'
    }),
    notFoundHTML = fs.readFileSync(path.resolve(__dirname, './tpl/404.html'), {
        encoding: 'utf8'
    });

//在接口所在文件夹下创建main.js
exports.buildCgiMainJS = (filename, type) => {
    let mainJSPath = path.resolve(__dirname, './tpl/main_' + (type ? type : 'simple') + '.js');

    let data = fs.readFileSync(mainJSPath, {
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
exports.buildCgiData = filename => {
	let data = {
		code: 123,
		message: '本地没有数据，请先执行数据录制'
	};

    fs.writeFile(filename, JSON.stringify(data, null, 4), err => {
        if (err) {
            console.log('build ' + filename + ' error: ' + err);
        }
        console.log('build ' + filename);
    });

    return data;
};

exports.buildMockjs = filename => {
    let data = {
        code: 123,
        message: 'mockjs 为空，请先填入模拟数据'
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
    return data;
};

//透传
exports.routeToServer = (req, res) => {
    let target = exports.generateURI();
    proxy.web(req, res, {
        target: target
    }, function(e) {
        if (e) {
            console.log(e);
        }
    });
};

exports.isJSONP = req => {
    return req.hostname === 'jsonp.ke.qq.com';
};

exports.buildDir = filename => {
    let fileDir = path.dirname(filename),
        arr = fileDir.split(/\/|\\/),
        baseDir = arr.shift();

    baseDir || (baseDir = '/');
    baseDir = baseDir.replace(/^\w:/, '/'); //高版本node不识别windows的盘符，盘符转化成根目录就可以
    for (let i = 0, len = arr.length; i <= len; i++) {
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
exports.renderHTML = content => {
    let data = '',
        configStr = JSON.stringify(config);
    newPointHTML = pointHTML.replace('{__master_config}', JSON.stringify(configStr));
    data = content
            .replace(/(<body[^>]*>)/, '$1\n</script>')
            .replace(/(<\/body>)/, newPointHTML + '$1');

    return data;
};

exports.render404 = info => {
    let configStr = JSON.stringify(config);

    newPointHTML = pointHTML.replace('{__master_config}', JSON.stringify(configStr));

    return notFoundHTML.replace('{errorInfo}', info).replace(/(<\/body>)/, newPointHTML + '$1');
};

exports.generateURI = path => {
    let  uri = '';
    //指定测试环境
    path || (path = '');

    if (config.mode === 'serverdata') {
        for (let i = 0, len = config.hosts.length; i < len; i++) {
            let host = config.hosts[i];

            if (host['selected']) {
                if (host['ip'] === '') {
                   console.log('选中的hosts["ip"]不能为空');
                   process.exit();
                } else if (host['ip'].indexOf('.com') !== -1) {
                    uri = host['ip'] + (host.port ? (':' + host.port) : '')  + path;
                } else {
                    uri = "http://" + host['ip'] + (host.port ? (':' + host.port) : '')  + path;
                }
                break;
            }
        }
    }
    return uri;
};

exports.jsonBody2Str = json => {
    let str = "";
    for (let p in json) {
        let value = json[p];

        value = encodeURIComponent(value);

        str += "&" + p + "=" + value;
    }
    return str.substr(1);
};
