# node-master
前端中转代理服务器

# 使用方式
**npm 全局安装**
```
npm install -g nfd-master
```
**切换到需要启动的项目下**
```
cd project
```
**创建配置文件**

在项目目录下创建config配置文件夹

```
mkdir masterConf
```
masterConf文件夹下创建index.js配置文件，如果是vue + webpack，并且需要修改webpack-dev-middleware或者webpack-hot-middleware
的配置，则还要设置middlewareConf.js覆盖默认配置，目录如下：

```
|-- masterConf
|------ index.js
|------ middlewareConf.js
```
```javascript
// masterConf/index.js

const path = require('path')

// 如果是vue + webpack的形式，需要引入middlewareConf.js，并合并配置 
const middlewareConf = require('./middlewareConf')

module.exports = Object.assign( middlewareConf, {
    // 当前使用的框架：webpack、fis3，默认是webpack
    frame: 'webpack',
    
    // 设置环境变量，可省参数，默认值：dev
    env: 'dev',

    // 项目启动的端口
    port: 8002,

    // webpack + vue 使用的路由类型：hash、history
    routerMode: 'hash',

    // 是否按照请求路径，copy响应数据到本地，1：拷贝；0：不拷贝
    copyDataToLocal: 0,

    // 数据代理模式，localdata： 本地数据，serverdata： 服务器数据
    mode: 'serverdata',

    // 统一代理的目标地址、端口号
    hosts: [{
        ip: '',
        selected: 1,
        desc: '',
        label: '',
        port: 8080
    }],
    
    // 不需要拦截的请求
    ignoreList: ['/pathA/pathB/pathC'],

    // 需要拦截转发的请求，会被转发到 hosts中指定的目标地址
    monitoringList: ['/pathA/pathB/*'],

    // 需要代理到其他特殊目标地址的请求，会被转发到 targetUrl 目标地址
    proxyTable: {
        'sourceUrl': 'targetUrl'
    },

    // 静态资源请求，对象形式，可设置多个请求链接
    staticUrls: {
        'sourceUrl': 'targetUrl'
    },
    
    // 开发环境下打包的目标文件夹，如果是webpack + vue 打包是在内存中的，写成当前文件根目录即可
    distRoot: path.resolve(__dirname, 'targetDir'),
});

```
```javascript
// masterConf/middlewareConf.js

let webpackConf = require('../build/webpack.dev.conf')

module.exports = {
  // webpack-dev-middleware配置
  webpackMiddleWareOption: {
    publicPath: webpackConf.output && webpackConf.output.publicPath,
    noInfo: false,
    quiet: false,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    index: 'index.html',
    headers: {
      'X-Custom-Header': 'yes'
    },
    stats: {
      colors: true,
      chunks: true,
      assets: true
    },
    reporter: null,
    serverSideRender: true
  },

  // webpack-hot-middleware配置
  hotMiddlewareOption: {}
}
```
**启动命令：nfd master**

port为可省端口参数，默认使用masterConf中设置的port，环境变量env为可省参数，默认使用masterConf中配置的env。

fis3项目无需执行fis3 imweb dev -wl命令单独打包，nfd-master已经集成了打包该打包命令。

```
nfd master -p port -e dev
```
