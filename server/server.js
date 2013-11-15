var http = require('http');
var url = require('url');
var fs = require('fs');
var trpl = require('./trpl.js');

var siteroot = '.';
var port = 8080;
var users = {
	'username': 'password'
};

var readMultiple = function(names, reader, operation, callback) {
	if (names.length > 0) {
		var count = names.length;
		for (var i = 0; i < names.length; i++) {
			reader(names, i, function(names, i, data) {
				operation(i, data);
				count--;
				if (count < 1)
					callback();
			});
		}
	} else
		callback();
};
var readProps = function(names, i, callback) {
	fs.readFile(siteroot + '/pages' + names[i] + 'code.txt', function(err, file) {
		callback(names, i, file ? file.toString() : undefined);
	});
};
var readData = function(names, i, callback) {
	if (names[i].match(/^[a-zA-Z0-9]+\s*\|\s*(\/|http(s)?:\/\/)/g)) {
		var name = names[i].substring(names[i].indexOf('|') + 1).replace(/^\s+|\s+$/g, '');
		if (name.indexOf('/') === 0) {
			name = '127.0.0.1:' + port + name;
		} else {
			name = name.replace(/^http(s)?:\/\//g, '');
		}
		var host = name.split('/')[0];
		var path = name.substring(host.length);
		var port = 80;
		if (host.indexOf(':') !== -1) {
			port = host.split(':')[1];
			host = host.split(':')[0];
		}
		http.get({host: host, port: port, path: path}, function(res) {
			var data = '';
		  	res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function() {
				callback(names, i, data);
			});
		}).on('error', function(e) {
			callback(names, i, undefined);
		});
	} else {
		var component = names[i].substring(0, names[i].indexOf('|')).replace(/^\s+|\s+$/g, '');
		var name = names[i].substring(names[i].indexOf('|') + 1).replace(/^\s+|\s+$/g, '');
		fs.readFile(siteroot + '/components/' + component + (name ? '/' + name : '') + '/data.json', function(err, fD) {
			callback(names, i, fD);
		});
	}
};
var readComponent = function(names, i, callback) {
	fs.readFile(siteroot + '/components/' + names[i].split('|')[0].replace(/^\s+|\s+$/g,'') + '/code.txt', function(err, tD) {
		callback(names, i, tD ? tD.toString() : '');
	});
};
var readComponentAndData = function(names, i, callback) {
	var object = {};
	readComponent(names, i, function(names, i, tData) {
		object.t = tData ? tData.toString() : '';
		readData(names, i, function(names, i, dData) {
			object.d = dData;
			callback(names, i, object);
		});
	});
};

var processPage = function(root, path, mode, success, failure, i) {
	conditionalIntermediary(root === '/pages', function(operation) {
		fs.readFile(siteroot + root + path + 'code.txt', function(err, file) {
			if (file) {
				operation(file);
			} else {
				failure('Connot find properties file');
			}
		});
	}, function(templateProp) {
		var template = templateProp !== undefined ? templateProp : path.substring(1).split('/')[0];
		if (template) {
			fs.readFile(siteroot + (root === '/pages' ? '/templates/' : root + '/') + template + '/code.txt', function(err, file) {
				if (file) {
					processTemplate(file.toString(), root, path, mode, function(html) {
						success(html);
					}, function(message) {
						failure(message);
					});
				} else {
					failure('Template not found');
				}
			});
		} else {
			failure('Invalid template identifier');
		}
	});
};

var batchTrim = function(list, trimLeft, trimRight) {
	var result = [];
	if (list) {
		for (var i = 0; i < list.length; i++) {
			result.push(list[i].substring(trimLeft || 0, list[i].length - (trimRight || 0)));
		}
	}
	return result;
};

var removeDuplicates = function(list) {
	var map = {},
		result = [];
	if (list) {
		for (var i = 0; i < list.length; i++) {
			map[list[i]] = null;
		}
	}
	for (var value in map) {
		result.push(value);
	}
	return result;
};

var buildPropsForm = function(templates, template) {
	var result = '<div><span>Choose a Template</span><div class="templates">';
	for (var i = 0; i < templates.length; i++) {
		result += '<span' + (templates[i] === template ? ' class="current"' : '') + '>' + templates[i] + '</span>';
	}
	return result + '</div></div></body></html>';
};

var buildCodeForm = function(code) {
	return '<textarea id="code" wrap="off">' + code + '</textarea>';
};

var buildUploadForm = function(path, updateStructure, showImage) {
	var extensionlessPath = path.replace(/\.[a-zA-Z0-9]+$/g, '/');
	var extension = path.match(/\.[a-zA-Z0-9]+$/g)
	if (extension) {
		extension = extension[0];
	} else {
		extension = '/';
	}
	return '<script> window.onkeydown = function(event) { parent.handleSpecialKeys(event); }; ' + (updateStructure ? 'parent.uploadSuccess(\'' + extensionlessPath + '\', \'' + extension + '\'); ' : '') + 'if (!parent.uploadFunctions) { parent.uploadFunctions = {}; } parent.uploadFunctions[\'' + extensionlessPath + '\'] = function(action) { ' + 
		' var form = document.getElementsByTagName(\'form\')[0]; form.action = action; form.submit(); };</script><form method="post" enctype="multipart/form-data"><input type="file" name="image"></form>' + (showImage ? '<img src="' + path + '" />' : '');
};

var buildLoginPage = function() {
	var result = '<!doctype html><html><head>';
	result += '<link href="/server/resources/login.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/server/resources/login.js"></script>';
	result += '</head><body><div><span>Password:</span><input type="password" id="password" />';
	result += '<input type="submit" id="send" value="Submit" />';
	return result + '</body></html>';
};

var buildOverviewForm = function() {
	var result = '<!doctype html><html><head>';
	result += '<link href="/server/resources/overview.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/server/resources/overview.js"></script>';
	return result + '</head><body><h1></h1><div><div class="children"></div></div></body></html>';
};

var buildInterface = function(rootpage) {
	var result = '<!doctype html><html><head><title>Editor</title>';
	result += '<link href="/r/interface.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/r/interface.js"></script>';
	result += '</head><body><div id="structure">';
	if (rootpage) {
		result += '<div id=""><span class="name">' + rootpage.name + '</span> : <span class="template">' + rootpage.template  + '</span><span class="fetch">+</span></div>'
	} else {
		result += '<div class="message"><a href="#">create</a> home page</div>';
	}
	result += '<div id="images/"><span class="label">Images</span><span class="fetch">+</span></div>';
	result += '<div id="files/"><span class="label">Files</span><span class="fetch">+</span></div>';
	result += '<div id="components/"><span class="label">Components</span><span class="fetch">+</span></div>';
	result += '<div id="templates/"><span class="label">Templates</span><span class="fetch">+</span></div>';
	result += '<div id="css/"><span class="label">Style Sheets</span><span class="fetch">+</span></div>';
	result += '<div id="js/"><span class="label">JavaScript</span><span class="fetch">+</span></div>';
	result += '</div><div id="workspace"><div id="banner"><div id="tabs"></div><div id="buttons"><a href="#" target="_blank" id="view">View</a><input type="button" onclick="saveActive()" value="Save" id="save" /></div></div><div id="sheets"></div></div>';
	return result + '<div id="overlay"><div id="login-container"><span>Username: </span><input type="text" id="username" /><br><span>Password: </span><input type="password" id="password" /><input type="submit" onclick="authenticate()" value="Log In" /></div></div></body></html>';
};

var prepareForJson = function(text) {
	return text.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/(\r\n|\n|\r)/g, '\\n').replace(/\"/g, '\\"');
};

var safeParse = function(json, fallback) {
	var result = fallback;
	try {
		result = JSON.parse(json.toString().replace(/(\r\n|\n|\r|\t)/g, ''));
	} catch(e) {}
	return result;
};

var processTemplate = function(rawTemplate, root, path, mode, success, failure) {
	fs.readFile(siteroot + root + path + 'data.json', function(err, file) {
		var template = rawTemplate,
			data = safeParse(file, {}),
			txtMap = {},
			keys = removeDuplicates(batchTrim(template.match(/\[[a-zA-Z0-9-_]+\]/g), 1, 1));
		readMultiple(keys, readComponent, function(i, file2) {
			txtMap[keys[i]] = file2.replace(/\[[a-zA-Z0-9-_]+\]/g, '');
		}, function() {
			for (var id in txtMap) {
				var i = 0;
				template = template.replace(new RegExp('\\[' + id + '\\]', 'g'), function(m) {
					i++;
					return '{' + id + (i > 1 ? '_' + i : '') + '|' + txtMap[id] + '}';
				});
			}
			if (mode === 'e') {
				success(trpl.createForm(root === '/pages' ? 'Page Data' : 'Component Data', template, data));
			} else if (mode === 'v') {
				template = trpl.createPage(template, data);
				txtMap = {};
				keys = removeDuplicates(batchTrim(template.match(/\[[a-zA-Z0-9-_]+\|[^\]]*\]/g), 1, 1));
				readMultiple(keys, readComponentAndData, function(i, file3) {
					txtMap[keys[i]] = trpl.createPage(file3.t, safeParse(file3.d));
				}, function() {
					for (var id in txtMap) {
						try {
							template = template.replace(new RegExp('\\[' + id.replace('|', '\\|') + '\\]', 'g'), function(m) {
								return txtMap[id];
							});
						} catch (e) {}
					}
					success(template);
				});
			} else {
				failure('Invalid Mode');
			}
		});
	});
};

var conditionalIntermediary = function(condition, intermediary, operation) {
	if (condition) {
		intermediary(operation);
	} else {
		operation();
	}
};

var contentTypeMap = {
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'text/json',
	'.htm': 'text/html',
	'.html': 'text/html',
	'.txt': 'text/plain',
	'.gif': 'image/gif',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.bmp': 'image/bmp',
	'.pdf': 'application/pdf',
	'.xml': 'application/xml'
};

var sessions = {};

var getUniqueSessionId = function() {
	var id = Math.floor(Math.random() * 2821109907455).toString(36);
	if (sessions[id] === undefined) {
		return id;
	} else {
		return getUniqueSessionId();
	}
}

setInterval(function() {
	var time = new Date().getTime();
	for (var key in sessions) {
		if (sessions[key] < time) {
			delete sessions[key];
		}
	}
}, 3600000);

var saveFile = function(path, body, callback) {
	var text = body;
	var boundary = text.substring(0, text.search(/[\r\n]/g));
	text = text.substring(boundary.length).replace(/^[\r\n]+/g, '');
	var disposition = text.substring(0, text.search(/[\r\n]/g));
	text = text.substring(disposition.length).replace(/^[\r\n]+/g, '');
	var type = text.substring(0, text.search(/[\r\n]/g));
	text = text.substring(type.length).replace(/^[\r\n]+/g, '');
	var file = text.substring(0, text.indexOf(boundary) - 2);
	var extension = disposition.match(/;\s*filename="[^"]*\.[a-zA-Z0-9]+"/g);
	if (extension) {
		extension = extension[0].substring(extension[0].lastIndexOf('.'), extension[0].length - 1);
		fs.writeFile(path.substring(0, path.length - 1) + extension, file, 'binary', function(err) {
			callback(err, extension);
		});
	} else {
		callback('invalid request');
	}
};

var formatResponse = function(condition, data) {
	var data = typeof data === 'function' ? data() : data;
	return '{"success":' + condition + (data !== undefined ? ',"data":' + (typeof data === 'string' ? '"' + data + '"' : JSON.stringify(data)) : '') + '}';
};

http.createServer(function(req, res) {
	var path = url.parse(req.url, true).pathname;
	var extension = path.match(/\.[a-zA-Z]+$/);
	var mode = 'v';
	var root = '/pages';
	var permission = true;
	if (path.match(/^\/[oesmudiarp]\//g)) {
		mode = path[1];
		path = path.substring(2);
	}
	if (!extension || !mode.match(/[vr]/g)) {
		if (!extension && path.charAt(path.length - 1) !== '/') {
			res.writeHead(302, {'Location': path + '/'});
			res.end();
		} else {
			var sessionId = '';
			if (!mode.match(/[vai]/g)) {
				sessionId = path.substring(1).split('/')[0];
				path = path.substring(sessionId.length + 1);
				var session = sessions[sessionId];
				if (session === undefined || session < new Date().getTime()) {
					permission = false;
				}
			}
			if (path.match(/^\/(templates|components|images|files|css|js)\//g)) {
				root = '/' + path.substring(1).split('/')[0];
				path = path.substring(root.length);
				if (root.match(/^\/(templates|components)$/g)) {
					if (mode === 'p') {
						mode = 'v';
					} else if (mode === 'v') {
						permission = false;
					}
				}
			}
			if (mode === 'v') {
				conditionalIntermediary(permission, function(operation) {
					processPage(root, path, mode, function(html) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(html);
					}, function(message) {
						operation();
					});
				}, function() {
					fs.readFile(siteroot + '/404.html', function(err, file) {
						res.writeHead(404, {'Content-Type': 'text/html'});
						res.end(file ? file.toString() : '');
					});
				});
			} else if (mode === 'i') {
				fs.readFile(siteroot + root + path + 'code.txt', function(err, file) {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.end(buildInterface(file ? {'name': path === '/' ? 'Home Page' : path.substring(path.substring(0, path.length - 1).lastIndexOf('/') + 1, path.length - 1), 'template': file} : null));
				});
			} else {
				res.writeHead(200, {'Content-Type': 'application/json'});
				if (mode === "a") {
					var data = '';
			        req.on('data', function (segment) {
			            data += segment;
			        });
			        req.on('end', function () {
			        	data = safeParse(data);
			        	res.end(formatResponse(data !== undefined && data.password === users[data.username], function() {
							var id = getUniqueSessionId();
							sessions[id] = new Date().getTime() + 3600000;
							return id;
			        	}));
					});
				} else if (permission) {
					if (mode === "o") {
						fs.readdir(siteroot + root + path, function(err, files) {
							var data = {};
							var validFolders = [];
							var validFiles = [];
							if (!err) {
								if (root === '/pages') {
									var validPaths = [];
									for (var i = 0; i < files.length; i++) {
										if (!files[i].match(/\.[a-zA-Z0-9]+$/g)) {
											validFolders.push(files[i]);
											validPaths.push(path + files[i] + '/');
										}
									}
									readMultiple(validPaths, readProps, function(i, file) {
										validFolders[i] = {'name': validFolders[i], 'template': file};
									}, function() {
										data.folders = validFolders;
										data.files = validFiles;
										res.end(formatResponse(true, data));
									});
								} else {
									if (root.match(/\/(components|templates|images|files)$/g)) {
										for (var i = 0; i < files.length; i++) {
											if (!files[i].match(/\.[a-zA-Z0-9]+$/g)) {
												validFolders.push({'name': files[i], 'template': ((root + path).match(/\/(templates|components)\//g) ? 'code' : '')})
											}
										}
									}
									if (!root.match(/\/(components|templates)$/g)) {
										for (var i = 0; i < files.length; i++) {
											if (files[i].match(/\.[a-zA-Z0-9]+$/g) && !files[i].match(/\.db$/g)) {
												validFiles.push({'name': files[i], 'template': ''});
											}
										}
									}
									data.folders = validFolders;
									data.files = validFiles;
									res.end(formatResponse(true, data));
								}
							} else {
								res.end(formatResponse(false));
							}
						});
					} else if (mode === "s" || mode === "u") {
						var data = '';
						req.setEncoding('binary');
				        req.on('data', function (segment) {
				            data += segment;
				        });
				        req.on('end', function () {
				        	if (mode === "s") {
				        		conditionalIntermediary(root !== '/pages', function(operation) {
									fs.readdir(siteroot + root + path, function(err, files) {
										conditionalIntermediary(err, function(operation2) {
											fs.mkdir(siteroot + root + path, function(err) {
												operation2();
											});
										}, operation);
									});
				        		}, function() {
									fs.writeFile(siteroot + root + path + 'data.json', data, function(err) {
										res.end(formatResponse(!err));
									});
								});
							} else if (mode === "u") {
								if (root.match(/\/(pages|templates|components)$/g)) {
									fs.readdir(siteroot + root + path, function(err, files) {
										conditionalIntermediary(err !== null, function(operation2) {
											fs.mkdir(siteroot + root + path, function(err) {
												operation2();
											});
										}, function() {
											fs.writeFile(siteroot + root + path + 'code.txt', data, function(err) {
												res.end(formatResponse(!err));
											});
										});
									});
								} else if (root.match(/\/(css|js)$/g)) {
									fs.writeFile(siteroot + root + path.substring(0, path.length - 1) + '.' + root.substring(1), data, function(err) {
										res.end(formatResponse(!err));
									});
								} else if (root.match(/\/(images|files)$/g)) {
									if (data) {
										saveFile(siteroot + root + path, data, function(err, extension) {
											res.writeHead(200, {'Content-Type': 'text/html'});
											res.end(buildUploadForm(root + path.substring(0, path.length - 1) + extension, !err ? true : false, !err && root === '/images' ? true : false));
										});
									} else {
										fs.mkdir(siteroot + root + path, function(err) {
											res.end(formatResponse(!err));
										});
									}
								}
							}
				        });
					} else if (mode === 'm') {
						if (root === '/pages') {
							fs.readdir(siteroot + '/templates/', function(err, files) {
								var template = null;
								fs.readFile(siteroot + root + path + 'code.txt', function(err, file) {
									res.end(formatResponse(true, prepareForJson(buildPropsForm(files, file ? file.toString() : undefined))));
								});
							});
						} else if (root.match(/\/(css|js)$/g)) {
							fs.readFile(siteroot + root + path, function(err, file) {
								res.end(formatResponse(true, prepareForJson(buildCodeForm(file ? file.toString() : ''))));
							});
						} else if (root.match(/\/(images|files)$/g)) {
							conditionalIntermediary(path.match(/\.[a-zA-Z0-9]+$/g), function(operation) {
								fs.readFile(siteroot + root + path, function(err, file) {
									operation(!err ? true : false);
								});
							}, function(exists) {
								res.writeHead(200, {'Content-Type': 'text/html'});
								res.end(buildUploadForm(root + path, false, exists && root === '/images' ? true : false));
							});
						} else {
							fs.readFile(siteroot + root + path + 'code.txt', function(err, file) {
								res.end(formatResponse(true, prepareForJson(buildCodeForm(file ? file.toString() : ''))));
							});
						}
					} else if (mode === 'd') {
						if (path !== '/' || root === '/pages') {
							if (root.match(/\/(css|js|images|files)$/g)) {
								fs.stat(siteroot + root + path, function(err, stat) {
									if (stat) {
										if (stat.isDirectory()) {
											fs.unlink(siteroot + root + path + 'Thumbs.db', function(err) {
												fs.rmdir(siteroot + root + path, function(err) {
													res.end(formatResponse(!err));
												});
											});
										} else if (stat.isFile()){
											fs.unlink(siteroot + root + path, function(err) {
												res.end(formatResponse(!err));
											});
										} else {
											res.end(formatResponse(false));
										}
									} else {
										res.end(formatResponse(false));
									}
								});
							} else {
								fs.unlink(siteroot + root + path + 'data.json', function(err) {
									fs.unlink(siteroot + root + path + 'code.txt', function(err2) {
										if (path !== '/') {
											fs.rmdir(siteroot + root + path, function(err3) {
												res.end(formatResponse(!err3));
											});
										} else {
											res.end(formatResponse(true));
										}
									});
								});
							}
						} else {
							res.end(formatResponse(false));
						}
					} else if (mode === 'e') {
						processPage(root, path, mode, function(html) {
							res.end(formatResponse(true, prepareForJson(html)));
						}, function(message) {
							res.end(formatResponse(false));
						});
					} else {
						res.end(formatResponse(false, 'Invalid Mode'));
					}
				} else {
					res.end(formatResponse(null));
				}
			}
		}
	} else {
		var root = siteroot;
		if (mode === 'r') {
			root = __dirname;
		}
		fs.readFile(root + path, function(err, resourceData) {
			if (resourceData != undefined) {
				if (extension == '.json' && urlObj.query.callback != undefined) {
					res.writeHead(200, {'Content-Type': 'application/javascript'});
					res.end(urlObj.query.callback + '(' + resourceData + ')');
				} else {
					res.writeHead(200, {'Content-Type': contentTypeMap[extension]});
					res.end(resourceData);
				}
			} else {
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('Resource not found');
			}
		});
	}
}).listen(port);

console.log('Server running at http://localhost:' + port + '/');