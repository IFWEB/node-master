module.exports = function () {
    var path = require('path'),
        childProcess = require('child_process'),
        serverName = path.resolve(__dirname, "app.js"),
        masterProcess,
        watchConfProcess;

    startServer();
    processListener(process);
    processListener (masterProcess);
    processListener (watchConfProcess);

    // node-master进程退出
    process.on('exit', function () {
        console.log('master exit!');
    });

    function killServer() {
        try {
            process.kill(masterProcess.pid);
            process.kill(watchConfProcess.pid);
        } catch (ex) {
            console.log("master: ", ex);
        }
    }

    function startServer() {
        masterProcess = childProcess.fork(serverName, process.argv);
        watchConfProcess = childProcess.fork(path.resolve(__dirname, "watchConfig.js"), process.argv);
    }

    function restartServer() {
        killServer();
        startServer();
        // 重新监听
        processListener (masterProcess);
        processListener (watchConfProcess);
    }

    function processListener (process) {
        // 信息传递监听
        process.on('message', function (msg) {
            switch (msg) {
                case 'exit':
                    process.exit();
                    break;
                case 'restart':
                    restartServer();
                    break;
            }
        });
        // 异常监听
        process.on('uncaughtException', function (e) {
            restartServer();
        });
    }
};
