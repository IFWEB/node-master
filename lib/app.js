let express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    commandParse = require('./commandParse'),
    program = commandParse(process), // 命令行识别
    exit = () => {
        try {
            process.send('exit');
            process.exit();
        } catch (ex) {
            console.log("master: ", ex);
        }
    };


// 获取config文件
let confPath = path.resolve(process.cwd(), 'masterConf/index.js');
if (fs.existsSync(confPath)) {
    global.config = require(confPath);
    global.frame = config.frame || 'webpack'; // 使用的框架，默认webpack
    config.port = program.port || config.port; // 优先使用命令行输入的端口
    process.env.NODE_ENV = program.env || config.env || 'dev';
} else {
    console.log('无法找到配置文件：', confPath);
    console.log('请确认是否创建了配置文件、是否已切换到项目目录下！');
    exit();
}

// 保存项目的实际路径
if (config.distRoot) {
    global.proPath = path.resolve(process.cwd(), config.distRoot);
} else {
    console.log(`${confPath}下找不到配置项：distRoot`);
    exit();
}


// 启动进程
let handler = require("./router/handler"),
    app = express();

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));

// 不同框架执行不同的打包命令
switch(frame) {
    case 'fis3':
        require('./fis3/index')();
        break;
    case 'webpack':
    default:
        require('./webpack/index')(app);
        break;
}

// 处理各种路由
handler(app);

// 静态资源
let keys = Object.keys(config.staticUrls);
for (var i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    app.use(key, express.static(config.staticUrls[key]));
}

// 监听
app.listen(config.port, function() {
    console.log("listening on port " + config.port);
});






