var request = require('request-ssl');
var fs = require('fs');

request.addFingerprint('m.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');
request.addFingerprint('www.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');


request('https://m.lcfarm.com/registerVerify.htm').pipe(fs.createWriteStream('doodle.png'));



