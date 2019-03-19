# node-master
前端中转代理服务器

# 使用方式
npm 全局安装
```
npm install nfd-master -g
```
切换到需要启动的项目下
```
cd project
```
在项目目录下创建config配置文件夹
```
mkdir masterConf
```
masterConf文件夹下创建index.js配置文件，如果是vue + webpack的形式，则还要设置middlewareConf.js，内容如下：
```
|-- masterConf
|------ index.js
|------ middlewareConf.js
```
```javascript
// masterConf/index.js
const path = require('path')
// 如果是vue + webpack的形式，需要引入middlewareConf.js 
const middlewareConf = require('./middlewareConf')

// 如果是vue + webpack的形式，需要合并middlewareConf
module.exports = Object.assign( middlewareConf, {
    // 设置环境变量，可省参数，默认值：dev
    env: 'dev',

    // 项目启动的端口
    port: 8002,

    // 使用vue框架时，采用的路由模式：history/hash
    routerMode: 'hash',

    // 是否按照请求路径，copy响应数据到本地
    //1：拷贝；0：不拷贝
    copyDataToLocal: 0,

    // 数据代理模式
    // localdata： 本地数据
    // serverdata： 服务器数据
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

    // 需要拦截转发的请求
    monitoringList: ['/pathA/pathB/*'],

    // 需要代理到其他特殊目标地址的请求
    proxyTable: {
        'sourceUrl': 'targetUrl'
    },

    // 静态资源请求，对象形式，可设置多个请求链接
    staticUrls: {
        'sourceUrl': 'targetUrl'
    },
    
    // 打包的目标文件夹
    distRoot: path.resolve(__dirname, 'targetDir'),
});

```
```javascript
// masterConf/middlewareConf.js
var webpackConf = require('../build/webpack.dev.conf')

module.exports = {
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

  hotMiddlewareOption: {}
}
```
在项目下启动node-master，port为可省端口参数，默认使用masterConf中设置的port。
```
nfd master frame -p port
```
frame是必须参数，是项目使用到的打包工具，目前只有两种：
* webpack
* fis3
