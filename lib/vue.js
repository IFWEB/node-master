module.exports = function (app) {
    var path = require('path'),
        fs = require('fs'),
        webpack = require("webpack"),
        webpackMiddleware = require('webpack-dev-middleware-nfd'),
        WebpackHotMiddleware = require('webpack-hot-middleware'),
        webpackConfPath = path.resolve(process.cwd(), 'build/webpack.dev.conf.js'),
        // OpenBrowserPlugin = require('open-browser-webpack-plugin'),
        webpackConf,
        compiler;

    // 获取webpack的配置文件
    if (fs.existsSync(webpackConfPath)) {
        webpackConf = require(webpackConfPath);
    } else {
        console.log('无法找到webpack配置文件：', webpackConfPath);
        try {
            process.send('exit');
            process.exit();
        } catch (ex) {
            console.log("master: ", ex);
        }
    }

    // 自动打开浏览器
    // webpackConf.plugins.push(new OpenBrowserPlugin({ url: `http://localhost:${config.port}` }))

    compiler = webpack(webpackConf);

    // vue 采用 history 时确保所有请求代理到index.html上
    if (config.routerMode && config.routerMode.toLowerCase() === 'history'){
        app.use(require('connect-history-api-fallback-nfd')({
            verbose: true,
            masterUrl: '/_master_'
        }));
    }

    app.use(webpackMiddleware(compiler, config.webpackMiddleWareOption || {}));

    app.use(WebpackHotMiddleware(compiler, config.hotMiddlewareOption || {}));
};
