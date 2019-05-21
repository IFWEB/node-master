const master = require('../lib/index');
const program = require('commander');
const pkg     = require('../package.json');

program
  .version(pkg.version);


program
    .command('master')
    .description('start node master')
    .option('-p, --port [port]', '指定端口号')
    .option('-e, --env [env]', '选择dist模式或者dev(默认)模式')
    .action(master);

program.parse(process.argv);
