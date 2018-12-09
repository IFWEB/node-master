var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    commandParse = require('./commandParse'),
    cwd = process.cwd(); // 启动位置

// 命令行识别
var program = commandParse(process);

// 记录框架
global.frame = process.argv[5];

// 进程退出
function exit() {
    try {
        process.send('exit');
        process.exit();
    } catch (ex) {
        console.log("master: ", ex);
    }
}

// 获取config文件
let confPath = path.resolve(cwd, 'masterConf/index.js');

if (!fs.existsSync(confPath)) {
    console.log('无法找到配置文件：', confPath);
    console.log('请确认是否创建了配置文件、是否已切换到项目目录下！');
    exit();
} else {
    global.config = require(confPath);
}

// 环境变量、端口设置
process.env.NODE_ENV = program.env || config.env || process.env.NODE_ENV || 'dev';	// 优先使用命令行输入的env
if (program.port) { // 优先使用命令行输入的端口
    config.port = program.port;
}

// 获取具体环境下配置项
let envConf = config[process.env.NODE_ENV];
if (!envConf) {
    console.log(`${confPath}下找不到配置对象：${process.env.NODE_ENV}`);
    exit();
}

// 保存项目的实际路径
if (envConf.distRoot) {
    global.proPath = path.resolve(cwd, envConf.distRoot);
} else {
    console.log(`${confPath}下找不到配置项：${process.env.NODE_ENV}.distRoot`);
    exit();
}



var handler = require("./router/handler"),
    app = express();

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));

// vue框架
if (frame === 'vue') {
    require('./vue')(app, cwd, exit);
}

// 处理各种路由
handler(app);

// 静态资源
let keys = Object.keys(envConf.staticUrls);
for (var i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    app.use(key, express.static(envConf.staticUrls[key]));
}

// 监听
app.listen(config.port, function() {
    console.log("listening on port " + config.port);
});






