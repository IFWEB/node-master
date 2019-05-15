var fs = require('fs'),
	path = require('path'),
	confPath = path.resolve(process.cwd(), 'masterConf/index.js');

if (!fs.existsSync(confPath)) {
	console.log('watchConf Error：无法找到配置文件 ', confPath);
    console.log('请确认是否创建了配置文件、是否已切换到项目目录下！');
	process.send('exit');
	process.exit();
}

// 监控config文件，修改后自动重启进程
var fsTimeout;

fs.watch(confPath, function(event) {
    if (!fsTimeout) {
        if (event === 'change') {
            console.log('master config changed!!!!');
            process.send('restart');
        }
        fsTimeout = setTimeout(function() { fsTimeout=null }, 5000) // 解决触发两次的问题
    }
});
