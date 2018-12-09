var request = require('request-ssl-nfd'),
    { URL } = require('url'),

    config = global.config,
    hps = require('../helpers');

/*
 * 华丽丽的 https 解决方案
 */
/*  request.addFingerprint('m.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');
    request.addFingerprint('www.lcfarm.com', 'A9:5B:61:39:86:B4:83:19:B1:91:77:9F:B7:46:A4:93:A3:2F:DE:49');
*/
/*
 * 对 request 进行封装，重新给后台发一次请求，并拦截返回的数据
 *
 * @param req request
 * @param res response
 * @param callback { fn } 回调，传入返回后拦截的数据
 */
function direct(req, res, callback) {
    var url = req.url,        
        isMedia = false;//是否媒体类型

    //强制要求不要返回gzip的格式
    delete req.headers["accept-encoding"];

    var options = {
        uri: req.targetUrl || hps.generateURI(url),
        method: req.method,
        headers: req.headers,
        timeout: 50000,
        encoding: 'utf8'
    };

    //针对转发到现网的处理，转发到内部服务器不需要
    if (options.uri.indexOf('.com') !== -1) {
        options.headers.host =new URL(options.uri).host;
    }

    //body是json格式 要转成&字符串格式
    if (req.headers['content-type'] && req.headers['content-type'].indexOf("application/json") > -1) {
        //body是json格式 要转成&字符串格式
        options.body = JSON.stringify(req.body);
    } else {
        options.body = hps.jsonBody2Str(req.body, req.method);
    }


    //判断是否是媒体数据
    isMedia = new RegExp(/(image\/|audio\/|video\/)/, 'i').test(options.headers.accept);

    console.log('----------------------------------start--------------------------------');
    console.log(options);
    console.log('----------------------------------end----------------------------------');



    //针对多媒体文件的处理
    if(isMedia){
        request(options).pipe(res);
    //针对其他非媒体数据的处理
    }else{
        //发起request请求
        request(options, function(e, response, body) {
            var status, data = body;
            if (e) {
                callback(e);
                return;
            }
            status = response.statusCode;
            if (status >= 200 && status < 300 || status === 304 || status === 1223) {
                if (hps.isJSONP(req)) {
                    //脱掉jsonp外衣
                    data = body.replace(/jQuery.*?\(/, '').replace(/\);.*/, '');
                }

                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // data = {message: '返回数据格式错误', body: data};
                }
                callback(null, data, response);
            } else {
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    data = {
                        message: '请求出错',
                        status: status
                    };
                }
                callback(data);
            }
        });
    }    
}


module.exports = direct;