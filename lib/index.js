module.exports = function () {
    var path = require('path'),
        childProcess = require('child_process'),
        serverName = path.resolve(__dirname, "app.js"),
        watchConfig = require('./watchConfig'),
        mainServer = childProcess.fork(serverName, process.argv);

    mainServer.on('uncaughtException', function (e) {
        console.log("master on error");
        console.log(e);
        restartServer();
    });

    process.on('exit', function () {
        console.log('master exit!');
    });

    process.on('uncaughtException', function (e) {
        console.log("master on error");
        console.log(e);
        restartServer();
    });

    function restartServer() {
        console.log("master restart...");
        killServer();

        mainServer = childProcess.fork(serverName, process.argv.slice(2));
        console.log("new server is built!\n");
    }

    function killServer() {
        try {
            process.kill(mainServer.pid);
        } catch (ex) {
            console.log("master: ", ex);
        }
    }

    // 监控config文件的修改，然后重启
    watchConfig(restartServer, killServer,  path.resolve(process.cwd(), 'config/index.js'))
};