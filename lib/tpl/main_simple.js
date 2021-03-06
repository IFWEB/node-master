const fs = require('fs'),
	path = require('path'),
	stripJson=require("strip-json-comments");


function parseData(data) {
	try {
		data = JSON.parse(data);
	} catch (e) {
		data = {code: 123, message: '返回数据格式错误'};
	}

	return data;
}

function generageFilePath(query, mode) {
	var filepath, filename;

    if(typeof query.pageNum !== 'undefined' || typeof query.pageNo !== 'undefined') {
        filename = `page_${query.pageNum || query.pageNo}.json`;
    } else {
        filename = 'data.json';
    }

	filepath = path.resolve(__dirname, filename);

	return filepath;
}

module.exports = function (query, mode) {
	query || (query = {});

	var data, filePath = generageFilePath(query, mode);

	switch(mode) {
		case 'localdata':
            if(fs.existsSync(filePath)) {
                data = fs.readFileSync(filePath, {encoding: 'utf8'});
                data = stripJson(data);
                data = parseData(data);
                data.__origin = filePath;

            } else {
                data = {code: 123, msg: '第' + query.page + '页没有数据，请先执行数据录制，或者在' + filePath + '文件中自己写入数据'};
            }
            break;
		default:
            data = fs.readFileSync(filePath, {encoding: 'utf8'});
            data = stripJson(data);
            data = parseData(data);

            if(data.code === 123) {
                //mockjs 数据为node index.js 生成，尝试读取录制的本地数据
                var localDataPath = generageFilePath(query, 'localdata');

                if(fs.existsSync(localDataPath)) {
                    var localData = fs.readFileSync(localDataPath, {encoding: 'utf8'});
                    localData = parseData(localData);

                    if(localData.code !== 123) {
                        data = localData;
                        data.__origin = localDataPath;
                    }
                }
            } else {
                data.__origin = filePath;
            }
	}
	return data;
};
