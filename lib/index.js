module.exports = function () {
    var path = require('path'),
        childProcess = require('child_process'),
        serverName = path.resolve(__dirname, "app.js"),
        masterProcess = childProcess.fork(serverName, process.argv),
        watchConfProcess = childProcess.fork(path.resolve(__dirname, "watchConfig.js"), process.argv);

    masterProcess.on('message', function (msg) {
        switch (msg) {
            case 'exit':
                process.exit();
                break;
            case 'restart':
                restartServer();
                break;
        }
    });

    masterProcess.on('uncaughtException', function (e) {
        console.log("master on error");
        console.log(e);
        restartServer();
    });

    watchConfProcess.on('message', msg => {
        switch (msg) {
            case 'exit':
                process.exit();
                break;
            case 'restart':
                restartServer();
                break;
        }
    });

    watchConfProcess.on('uncaughtException', function (e) {
        console.log("watchConf on error");
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

        masterProcess = childProcess.fork(serverName, process.argv.slice(2));
        console.log("new server is built!\n");
    }

    function killServer() {
        try {
            process.kill(masterProcess.pid);
            process.kill(watchConfProcess.pid);
        } catch (ex) {
            console.log("master: ", ex);
        }
    }
};