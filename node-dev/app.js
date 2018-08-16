var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    program = require('commander'),
    config = require('./config'),
    selectedPro = process.argv[2] || '';

var log4js = require('../log4.js'),
    logger = log4js.logger;

program
    .version('0.0.1')
    .option('-p, --port <n>', '指定端口号', parseInt)
    .option('-e, --env <n>', '选择dist模式或者dev(默认)模式')
    .parse(process.argv);

if (program.port) {
    port = program.port;
} else {
    port = 5001;
}

global.selectedPro = selectedPro;
global.rootPath = path.resolve(__dirname, '..');
global.proPath = path.resolve(global.rootPath, selectedPro);
global.proDevPath = path.resolve(global.rootPath, selectedPro + '-dev');
global.proDistPath = path.resolve(global.rootPath, selectedPro + '-dist');
console.log("global.proDevPath:" + global.proDevPath);


var handler = require("./router/handler"),
    routeDir = require('./middleware/routeDir'),
    port,
    proList = ['h5', 'pc', 'activity'],
    app = express();

app.use(log4js.connectLogger(logger));

config.port = port;

if (!selectedPro || proList.indexOf(selectedPro.toLowerCase()) === -1) {
    console.log('请输入要开启的项目');
    process.exit();
}

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));

handler(app);

console.log("config.env:" + config.env);
if (config.env === 'dev') {
    //logger.info('成功');
    app.use(express.static(global.proDevPath));
    app.use('/static/pc-dev', express.static(global.proDevPath));
    app.use('/static/h5-dev', express.static(global.proDevPath));
    app.use('/static/activity-dev', express.static(global.proDevPath));
    app.use(routeDir(global.proDevPath));
} else if (config.env === 'dist') {
    app.use(express.static(global.proDistPath));
    app.use('/static/pc-dist', express.static(global.proDistPath));
    app.use('/static/h5-dist', express.static(global.proDistPath));
    app.use('/static/activity-dist', express.static(global.proDistPath));
    app.use(routeDir(global.proDistPath));
}


app.listen(config.port, function() {
    console.log("listening on port " + config.port);
});