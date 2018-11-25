module.exports = function (restartServer, killServer, confPath)  {
    var fs = require('fs');

    if (!fs.existsSync(confPath)) {
        console.log('无法找到配置文件：', confPath);
        killServer();
    }

    // 监控config文件，修改后自动重启进程
    fs.watch(confPath, function (event, filename) {
        if (event === 'change') {
            restartServer();
        }
    });
};