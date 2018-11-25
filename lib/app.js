var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    commandParse = require('./commandParse'),
    cwd = process.cwd(); // 启动位置

// 命令行识别
var program = commandParse(process);

// 进程退出
function exit() {
    try {
        process.exit();
    } catch (ex) {
        console.log("master: ", ex);
    }
}

// 必须输入所使用的框架
var frame = program.frame;
if (frame === undefined) {
    console.log('请输入项目所使用的框架');
    exit();
}

// 获取通用的 config 配置
var confPath = path.resolve(cwd, 'config/index.js'),
    config,
    envConf;
if (!fs.existsSync(confPath)) {
    console.log('无法找到配置文件：', confPath);
    exit();
}
config = require(confPath);
process.env.NODE_ENV = program.env || config.env || process.env.NODE_ENV || 'dev'; // 环境
envConf = config[process.env.NODE_ENV];

// 挂载到全局，方便后期调用
global.frame = frame;
global.config = config;
global.proPath = path.resolve(cwd, envConf.distRoot); // 实际的项目位置
if (program.port) { // 优先使用命令行输入的端口
    config.port = program.port;
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
for (var i = 0, len = envConf.staticUrls.length; i < len; i++) {
    app.use(envConf.staticUrls[i], express.static(envConf.staticPath));
}

// 监听
app.listen(config.port, function() {
    console.log("listening on port " + config.port);
});






