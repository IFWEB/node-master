var path = require('path');

module.exports = {

    //设为1时：自动拷贝cgi数据到本地。必要条件： mode = serverdata
    //设为0时：不拷贝cgi数据
    copyDataToLocal: 0,

    //localdata 本地数据
    //serverdata 服务器数据
    //mockjs 本地 mockjs
    mode: 'serverdata',
    env: 'dev',


    //指定测试环境数据
    //必要条件：mode = serverdata
    hosts: [{
        ip: '10.1.60.116',
        selected: 0,
        desc: '测试环境116',
        label: '.116',
        proxyPort: {
            pc: 8000,
            h5: 8001
        }
    }, {
        ip: '10.1.60.120',
        selected: 0,
        desc: '测试环境120',
        label: '.120',
        proxyPort: {
            pc: 8000,
            h5: 8001
        }
    }, {
        ip: '10.1.60.23',
        selected: 0,
        desc: '测试环境23',
        label: '.23',
        proxyPort: {
            pc: 8000,
            h5: 8001
        }
    }, {
        ip: '10.1.60.63',
        selected: 0,
        desc: '测试环境63',
        label: '.63',
        proxyPort: {
            pc: 8000,
            h5: 8001
        }
    }, {
        ip: '10.1.60.113',
        selected: 0,
        desc: '113',
        label: '.113',
        proxyPort: {
            pc: 8000,
            h5: 8001
        }
    }, {
        ip: '10.1.13.69',
        selected: 0,
        desc: 'boqing',
        label: '.boqing',
        proxyPort: {
            h5: 8011,
            api: 8011,
            activity: 8012
        }
    },  {
        ip: '10.1.13.14',
        selected: 0,
        desc: 'hanhan',
        label: '.hanhan',
        proxyPort: {
            h5: 8011,
            api: 8011,
            activity: 8012
        }
    }, {
        ip: '10.1.13.31',
        selected: 0,
        desc: 'duohan',
        label: '.duohan',
        proxyPort: {
            h5: 8011,
            api: 8011
        }
    }, {
        ip: '',
        selected: 1,
        desc: '现网',
        label: '现网',
        proxyPort: {
            pc: 80,
            h5: 80
        }
    }, {
        ip: '10.1.13.63',
        selected: 0,
        desc: '俊孟',
        label: '俊孟',
        proxyPort: {
            pc: 8011,
            h5: 80
        },
    }],
    //排除的接口列表，不做任何处理直接透传req
    ignoreList: [],

    yapi: {
        ip: '10.1.60.110',
        url: {
            pc: '/mock/14',
            h5: '/mock/11'
        },
        proxyPort: {
            pc: 80,
            h5: 80
        }
    },

    port: 80
};