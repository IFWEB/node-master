module.exports = function (process) {
    var program = require('commander');

    // 命令行识别
    program
        .version('0.0.1')
        .option('-f, --frame [frame]', '项目的框架')
        .option('-p, --port [port]', '指定端口号')
        .option('-e, --env [env]', '选择dist模式或者dev(默认)模式')
        .parse(process.argv);

    return program;
};