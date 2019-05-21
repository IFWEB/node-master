module.exports = function (app) {
    let webpack = require("webpack"),
        webpackMiddleware = require('webpack-dev-middleware-nfd'),
        WebpackHotMiddleware = require('webpack-hot-middleware'),
        webpackConf = require('./webpack.config'),
        compiler = webpack(webpackConf.devConfig);

    // webpack 采用 history 时确保所有请求代理到index.html上
    if (config.routerMode && config.routerMode.toLowerCase() === 'history') app.use(require('connect-history-api-fallback-nfd')({verbose: true, masterUrl: '/_master_'}));
    app.use(webpackMiddleware(compiler, webpackConf.webpackDevMiddleWareConfig));
    app.use(WebpackHotMiddleware(compiler, webpackConf.hotMiddlewareConfig));
};
