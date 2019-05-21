let path = require('path'),
    fs = require('fs'),
    webpackDevConfigPath = path.resolve(process.cwd(), 'build/webpack.dev.conf.js');

// 获取webpack的配置文件
if (fs.existsSync(webpackDevConfigPath)) {
    webpackConf = require(webpackDevConfigPath);
} else {
    console.log('无法找到webpack配置文件：', webpackDevConfigPath);
    try {
        process.send('exit');
        process.exit();
    } catch (ex) {
        console.log("master: ", ex);
    }
}

let  devConfig = require(webpackDevConfigPath);
module.exports = {
    devConfig,
    webpackDevMiddleWareConfig: config.webpackDevMiddleWareConfig || {},
    hotMiddlewareConfig: config.hotMiddlewareConfig || {}
};
