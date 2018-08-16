var url = require('url'),
	path = require('path'),
	fs = require('fs');

module.exports = function (rootPath) {
	
	return function(req, res, next) {
	    var pathname = url.parse(req.url).pathname;
	    var fullpath = path.join(rootPath, pathname);

	    if (/\/$/.test(pathname) && fs.existsSync(fullpath)) {
	        var stat = fs.statSync(fullpath);

	        if (stat.isDirectory()) {
	            var html = '';

	            var files = fs.readdirSync(fullpath);

	            html = '<!doctype html>';
	            html += '<html>';
	            html += '<head>';
	            html += '<title>' + pathname + '</title>';
	            html += '</head>';
	            html += '<body>';
	            html += '<h1> - ' + pathname + '</h1>';
	            html += '<div id="file-list">';
	            html += '<ul>';

	            if(pathname != '/'){
	                html += '<li><a href="' + pathname + '..">..</a></li>';
	            }

	            files.forEach(function(item) {
	                var s_url = path.join(pathname, item);
	                html += '<li><a href="' + s_url + '">'+ item + '</a></li>';
	            });

	            html += '</ul>';
	            html += '</div>';
	            html += '</body>';
	            html += '</html>';

	            res.set('Content-Type', 'text/html');

	            res.send(html);
	            return;
	        }
	    }

	    next();
	};
}