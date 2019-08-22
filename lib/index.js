module.exports = function () {
    let path = require('path'),
        childProcess = require('child_process'),
        masterProcess,
        watchConfProcess,
        parentProcess = process,
        killServer = () => {
            try {
                if (masterProcess.pid) process.kill(masterProcess.pid);
                if (watchConfProcess.pid) process.kill(watchConfProcess.pid);
            } catch (ex) {
                console.log("master: ", ex);
            }
        },
        startServer = () => {
            masterProcess = childProcess.fork(path.resolve(__dirname, "app.js"), process.argv);
            watchConfProcess = childProcess.fork(path.resolve(__dirname, "./watchConf/watchConfig.js"), process.argv);
        },
        restartServer = () => {
            killServer();
            startServer();
            // 重新监听
            processListener (masterProcess);
            processListener (watchConfProcess);
        },
        processListener = process => {
            // 子进程事件监听
            process.on('message', msg => {
                switch (msg) {
                    case 'exit':
                        parentProcess.exit();
                        break;
                    case 'restart':
                        restartServer();
                        break;
                }
            });
            // 异常子进程监听
            process.on('uncaughtException', function (e) {
                parentProcess.exit();
            });
        };


    startServer();
    processListener(process);
    processListener (masterProcess);
    processListener (watchConfProcess);

    // node-master进程退出
    process.on('exit', function () {
        console.log('master exit!');
    });
};
