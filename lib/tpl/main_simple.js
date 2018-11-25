/******* main.js **********/
var fs = require('fs'),
	path = require('path'),
	Mock = require('mockjs'),
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

	if(mode === 'localdata') {
		if(typeof query.page !== 'undefined') {
			filename = 'page_' + query.page + '.json';
		} else {
			filename = 'data.json';
		}
	} else if(mode === 'mockjs') {
		filename = 'mock.json';
	}

	filepath = path.resolve(__dirname, filename);

	return filepath;
}

module.exports = function (query, mode) {
	query || (query = {});

	var data, filePath = generageFilePath(query, mode);

	if(mode === 'localdata') {
		if(fs.existsSync(filePath)) {
			data = fs.readFileSync(filePath, {encoding: 'utf8'});
			data = stripJson(data);
			data = parseData(data);
			data.__origin = filePath;

		} else {
			data = {code: 123, msg: '第' + query.page + '页没有数据，请先执行数据录制，或者在' + filePath + '文件中自己写入数据'};
		}
	} else {
		data = fs.readFileSync(filePath, {encoding: 'utf8'});
		data = stripJson(data);
		data = parseData(data);
		data = Mock.mock(data);

		if(data.code === 123) {
			//mockjs 数据为node master.js 生成，尝试读取录制的本地数据
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
	

	//自定义数据过滤器

	return data;
};