var fs=require("fs"),
    childProcess = require('child_process'),
    serverName="./node-dev/app.js",
    mainServer = childProcess.fork(serverName, process.argv.slice(2)),
    log4js = require('./log4.js'),
    logger = log4js.logger;

mainServer.on('uncaughtException', function(e) {
    console.log("master on error");
    logger.error(e);
　　 console.log(e);
    restartServer();
});

process.on('exit', function () {
　　console.log('master exit!');
});

process.on('uncaughtException', function(e) {
    console.log("master on error");
    logger.error(e);
    console.log(e);
    restartServer();
});

function restartServer(){
    console.log("master restart...");
    killServer();

    mainServer = childProcess.fork(serverName, process.argv.slice(2));
    console.log("new server is built!\n");
}

function killServer(){
     try{
         process.kill(mainServer.pid);
     }catch(ex){
         console.log("master: ",ex);
     }
}