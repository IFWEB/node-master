module.exports = function (app, cwd, exit) {
    var path = require('path'),
        fs = require('fs'),
        webpack = require("webpack"),
        webpackMiddleware = require('webpack-dev-middleware-nfd'),
        WebpackHotMiddleware = require('webpack-hot-middleware'),
        webpackConfPath = path.resolve(cwd, 'build/webpack.dev.conf.js'),
        config = global.config,
        webpackConf,
        compiler;

    // 获取webpack的配置文件
    if (fs.existsSync(webpackConfPath)) {
        webpackConf = require(webpackConfPath);
    } else {
        console.log('无法找到webpack配置文件：', webpackConfPath);
        exit();
    }
    compiler = webpack(webpackConf);

    // vue 采用 history 时确保所有请求代理到index.html上
    if (config.routerMode && config.routerMode.toLowerCase() === 'history'){
        app.use(require('connect-history-api-fallback-nfd')({
            verbose: true,
            masterUrl: '/_master_'
        }));
    }

    app.use(webpackMiddleware(compiler, {
        // publicPath is required, whereas all other options are optional

        noInfo: true,
        // display no info to console (only warnings and errors)

        quiet: false,
        // display nothing to the console

        lazy: false,
        // switch into lazy mode
        // that means no watching, but recompilation on every request

        watchOptions: {
            aggregateTimeout: 300,
            poll: true
        },
        // watch options (only lazy: false)

        publicPath: webpackConf.output.publicPath,
        // public path to bind the middleware to
        // use the same as in webpack

        index: "index.html",
        // the index path for web server

        headers: {
            "X-Custom-Header": "yes"
        },
        // custom headers

        stats: {
            colors: true,
            chunks:false,
            assets:false
        },
        // options for formating the statistics

        reporter: null,
        // Provide a custom reporter to change the way how logs are shown.

        serverSideRender: true,
        // Turn off the server-side rendering mode. See Server-Side Rendering part for more info.
    }));

    app.use(WebpackHotMiddleware(compiler, {
        log: console.log
    }));
};