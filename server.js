var http = require('http');
var url = require('url');
var fs = require('fs');

// replace sysroot with the path to your project for Mac (e.g. /users/.../.../node-trpl)
var sysroot = '.';
var port = 8080;

var trpl={process:function(s,d){if(typeof s==="string"){return trpl.parse(s,[d],0,[],[],[])}else{return""}},parse:function(s,d,x,i,t,l){var pS=s.match
(/^(\\[{}]|[^{}])*/g)[0],nS=s.substring(pS.length),rS=!x?pS.replace(/\\[{}]/g,function(m){return m[1]}):"";if(nS[0]==="{"){pS=nS.match(
/^(\\[|}]|[^|}])*/g)[0];nS=nS.substring(pS.length);if(x){if(nS[0]==="|"){x++}}else{var iO=trpl.interpret(pS.substring(1),d,i,l);if(nS[0]==="}"){if(iO.
length>0){for(var j=0;j<iO.length;j++){if(typeof iO[j]==="object"){rS+=JSON.stringify(iO[j])}else{rS+=iO[j]}}}else{if(typeof iO==="boolean"){rS+=iO}}}
else{if(nS[0]==="|"){if(iO.length>0){nS=nS.substring(1);t.splice(0,0,"o");d.splice(0,0,null);i.splice(0,0,0);l.splice(0,0,iO.length);for(var j=0;j<iO.
length;j++){d[0]=iO[j];i[0]++;rS+=trpl.parse(nS,d,x,i,t,l)}nS=""}else{if(iO===true){t.splice(0,0,"c")}else{x++}}}}}if(nS){rS+=trpl.parse(nS.substring(
1),d,x,i,t,l)}}else{if(nS[0]==="}"){if(x){x--}else{if(t[0]==="o"){if(i[0]>=l[0]){t.splice(0,1);d.splice(0,1);l.splice(0,1);i.splice(0,1)}else{nS=""}}
else{t.splice(0,1)}}if(nS){rS+=trpl.parse(nS.substring(1),d,x,i,t,l)}}}return rS},interpret:function(s,d,i,l){var sA=s.split(";"),pS="",nS="",pN=0,pB=
null,kA=[],nA=null,tB=false,qB=null,sB=false,iB=false,qO=[],qA=[];for(var j=0;j<sA.length;j++){nS+=sA[j];if(nS[nS.length-1]!=="\\"||j===sA.length-1){
pS=nS.match(/^[$\s]*/g)[0];nS=nS.substring(pS.length);pN=pS.split("$").length-1;qO=d[pN];pS=nS.match(/^(\\[#%?!=<>]|[^#%?!=<>])*/g)[0];nS=nS.substring
(pS.length);tB=false;nA=null;sB=false;iB=false;pB=false;if(pS.length>0){kA=pS.split("$");pS="";for(var k=0;k<kA.length;k++){pS+=kA[k].replace(
/^\s+|\s+$/g,"").replace(/\\[#%?!=<>|}]/g,function(m){return m[1]});if(pS[pS.length-1]!=="\\"||k===kA.length-1){if(pS.length>0&&typeof qO==="object"){
if(qO.length!==undefined&&!isNaN(pS)){pS=parseInt(pS);pS=pS>0?pS-1:pS<0?qO.length+pS:""}qO=qO[pS]}else{qO=undefined}pS=""}else{pS=pS.substring(0,pS.
length-1)+"$"}}tB=true}if(nS.length>0){pS=nS.match(/^(#\s*-?[0-9]*\s*)?/g)[0];nS=nS.substring(pS.length);if(pS.length>0){if(typeof qO==="object"&&qO.
length!==undefined){pS=parseInt(pS.substring(1));if(!isNaN(pS)){kA=qO.slice(0,qO.length);nA=[];if(pS<0){pS*=-1;kA.reverse()}for(var k=pS<0?-pS:pS;k>0;
k--){nA.push(kA.splice(0,pS<0?Math.floor(kA.length/k):Math.ceil(kA.length/k)))}qO=undefined;pB=null}else{qO=qO.length}}else{qO=undefined}tB=true}if(nS
.length>0){pS=nS.match(/^(%\s*-?[0-9]*\s*)?/g)[0];nS=nS.substring(pS.length);if(pS.length>0){pS=parseInt(pS.substring(1));if(!isNaN(pS)){if(typeof qO
==="object"&&qO.length!==undefined){kA=qO.slice(0,qO.length);nA=[];if(pS<0){pS*=-1;kA.reverse()}if(pS===1){for(var k=0;k<qO.length;k++){nA.push(kA[k])
}}else{for(var k=0;k<Math.ceil(qO.length/pS);k++){nA.push(kA.splice(0,pS))}}pB=null}qO=undefined}else{if(!tB){qO=i[pN];iB=true}}tB=true}if(nS.length>0
){pS=nS.match(/^\?\s*$/g);if(pS){sB=true}else{pS=nS.match(/^[!=<>].*/g);if(pS&&pB!==null){nS=pS[0][0];pS=pS[0].substring(1);pB=false;if(pS.length>0){
if(!isNaN(pS)){pS=parseInt(pS);if(iB&&pS<0){pS=l[pN]+(pS+1)}}if(!isNaN(qO)){qO=parseInt(qO)}if(nS==="!"&&qO!==pS||nS==="="&&qO===pS||nS==="<"&&qO<pS||
nS===">"&&qO>pS){pB=true}}else{if(nS==="!"&&(!qO&&qO!==0||qO.length===0)||nS==="="&&(qO&&qO.length!==0||qO===0)){pB=true}}if(qB===null||pB){qB=pB}}qO=
undefined}}}}if(nA===null){nA=[qO]}for(var k=0;k<nA.length;k++){if(sB||(nA[k]&&nA[k].length!==0||nA[k]===0)){qA.push(nA[k])}}nS=""}else{nS=nS.
substring(0,nS.length-1)+";"}}if(qB!==null){return qB}else{return qA}}};

var trpla={process:function(l,s,d){var t=trpla.parse(s,0,[],[]);return trpla.render(l,t[0],d)},render:function(l,s,d){var result="";if(s!==null){if(s
===undefined){var object=typeof d==="string"?d:"";result='<div class="string"><span>'+l+"</span><textarea>"+(typeof d==="string"?d:"")+
"</textarea></div>"}else{if(s.length!==undefined){var object=typeof d==="object"&&d.length!==undefined?d:[];result+='<div class="array"><span>'+l+
'</span><div class="blank">'+trpla.render("",s[0],s[0])+"</div>";for(var j=0;j<object.length;j++){result+=trpla.render(j+1,s[0],object[j])}result+=
'<div class="above"><span class="flip"></span><span class="add">Add Element Above</span><span class="remove">Remove Element Above</span></div></div>'}
else{var object=typeof d==="object"&&d.length===undefined?d:{};result+='<div class="object"><span>'+l+"</span>";for(var key in s){result+=trpla.render
(key,s[key],object[key])}result+="</div>"}}}return result},combine:function(one,two){var result=null;if(one!==null&&two!==null){if(one===undefined){
result=two}else{if(two===undefined){result=one}else{if(typeof one==="object"&&typeof two==="object"){if(one.length===undefined&&two.length===undefined
){result=one;for(var key in two){result[key]=trpla.combine(one[key],two[key])}}else{var trueOne=[];var trueTwo=[];if(one.length===undefined){for(var 
key in one){if(!isNaN(key)){trueOne[key]=one[key]}else{trueOne=one;break}}}else{trueOne=one}if(two.length===undefined){for(var key in two){if(!isNaN(
key)){trueTwo[key]=two[key]}else{trueTwo=two;break}}}else{trueTwo=two}if(trueOne.length!==undefined&&trueTwo.length!==undefined){result=[trpla.combine
(trueOne[0],trueTwo[0])]}}}}}}return result},create:function(key,object){var splitKey=key.split("$"),result=object,newResult={};for(var k=splitKey.
length-1;k>=0;k--){newResult={};newResult[splitKey[k]]=result;result=newResult}return result},parse:function(s,x,keys,structure){var pS=s.match(
/^(\\[{}]|[^{}])*/g)[0],bC=s[pS.length],nS=s.substring(pS.length+1);if(bC==="{"){pS=nS.match(/^(\\[|}]|[^|}])*/g)[0];ns=nS.substring(pS.length);if(x){
x++}else{var iA=trpla.interpret(pS);if(iA.length>0){keys.splice(0,0,iA);if(iA[0]){structure.splice(0,0,undefined)}}else{x++}}trpla.parse(nS,x,keys,
structure)}else{if(bC==="}"){if(x){x--}else{if(!keys[0][0]){structure.splice(0,0,undefined)}for(var j=1;j<keys[0].length;j++){var key=keys[0][j],
isArray=false,evenSplit=false;if(typeof key==="object"&&key.length!==undefined){key=key[0];isArray=true;if(typeof key==="object"&&key.length!==
undefined){key=key[0];evenSplit=true}}var parent=key.search(/[^\s]/g)+1,key=key.substring(parent-1);if(parent===0){structure[1]=trpla.combine(
structure[1],isArray?evenSplit?structure[0][0]:[structure[0]]:structure[0])}else{if(structure[parent]!==null){structure[parent]=trpla.combine(
structure[parent],trpla.create(key,isArray?evenSplit?structure[0][0]:[structure[0]]:structure[0]))}}}keys.splice(0,1);structure.splice(0,1)}trpla.
parse(nS,x,keys,structure)}}return structure},interpret:function(s){var sA=s.split(";"),pS="",nS="",qO="",qA=[],pB=true;iB=null;for(var j=0;j<sA.
length;j++){nS=sA[j].replace(/^\s+/g,"");pS=nS.replace(/^\s+/g,"").match(/^[$]*/g)[0];nS=nS.substring(pS.length);qO="";pB=true;for(var k=0;k<pS.length
;k++){qO+=" "}pS=nS.match(/^[^#%?!=<>]*/g)[0];nS=nS.substring(pS.length);qO+=pS.replace(/\s*\$\s*/g,"$").replace(/^\s+|\s+$/g,"");if(nS.length>0){pS=
nS[0];nS=nS.substring(1);if(pS==="#"){pS=nS.match(/^(-?[0-9]+)?/g)[0];nS=nS.substring(pS.length);pS=parseInt(pS);if(!isNaN(pS)){pB=null}pS=nS[0];nS=nS
.substring(1)}if(pS==="%"){if(nS==="1"||nS==="-1"){qO=[qO]}pS=nS.match(/^(-?[0-9]+)?/g)[0];nS=nS.substring(pS.length);pS=nS[0];nS=nS.substring(1)}if(
pB!==null&&pS!==undefined){if(pS.match(/^[!=]$/g)||pS.match(/^[!=<>].*$/g)){nS="";pB=false}}else{pB=true}nS=nS.replace(/^\s+/g,"");if(nS.length>0){qO=
null}}if(iB===null){iB=pB}else{if(iB!==pB){return[]}}if(qO!==null){qA.push(qO)}}if(qA.length>0){qA.splice(0,0,iB)}return qA}};

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
	fs.readFile(sysroot + '/pages' + names[i] + 'page.txt', function(err, file) {
		callback(names, i, file ? file.toString() : undefined);
	});
};
var readData = function(names, i, callback) {
	fs.readFile(sysroot + '/components/json/' + names[i] + '.json', function(err, fD) {
		callback(names, i, fD);
	});
};
var readComponent = function(names, i, callback) {
	fs.readFile(sysroot + '/components/' + names[i] + '.txt', function(err, tD) {
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
		fs.readFile(sysroot + root + path + 'page.txt', function(err, file) {
			if (file) {
				operation(file);
			} else {
				failure('Connot find properties file');
			}
		});
	}, function(templateProp) {
		var template = templateProp !== undefined ? templateProp : path.substring(1);
		if (template) {
			fs.readFile(sysroot + (root === '/pages' ? '/templates/' : root + '/') + template + '.txt', function(err, file) {
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
			failure('Invalid template');
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

var wrapEditForm = function(form) {
	var result = '<!doctype html><html><head>';
	result += '<link href="/server/resources/edit.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/server/resources/edit.js"></script>';
	result += '</head><body>';
	result += form;
	result += '<input type="submit" id="send" class="page" value="Save" />';
	return result + '</body></html>';
};

var buildPropsForm = function(templates, template) {
	var result = '<!doctype html><html><head>';
	result += '<link href="/server/resources/modifyProps.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/server/resources/modifyProps.js"></script>';
	result += '</head><body><div><span>Template:</span><select id="template">';
	for (var i = 0; i < templates.length; i++) {
		result += '<option' + (templates[i] === template ? ' selected' : '') + '>' + templates[i] + '</option>';
	}
	result += '</select></div><input type="submit" id="send" value="Save" />';
	return result + '</body></html>';
};

var buildCodeForm = function(code) {
	var result = '<!doctype html><html><head>';
	result += '<link href="/server/resources/modifyCode.css" rel="stylesheet" />';
	result += '<script type="text/javascript" src="/server/resources/modifyCode.js"></script>';
	result += '</head><body><textarea id="code">';
	result += code;
	result += '</textarea><input type="submit" id="send" value="Save" />';
	return result + '</body></html>';
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
}

var safeParse = function(json, fallback) {
	var result = fallback;
	try {
		result = JSON.parse(json);
	} catch(e) {}
	return result;
};

var processTemplate = function(rawTemplate, root, path, mode, success, failure) {
	fs.readFile(sysroot + root + (root !== '/pages' ? '/json' : '') + path + (root === '/pages' ? 'page' : '') + '.json', function(err, file) {
		var template = root === '/pages' ? rawTemplate : root === '/templates' ? rawTemplate.replace(/{{{[a-zA-Z0-9]*}}}/g, function(m) { return m.substring(1, m.length - 1) }) : rawTemplate.replace(/{{{[a-zA-Z0-9]*}}}/g, ''),
			component = '',
			data = safeParse(file),
			txtMap = {},
			keys = removeDuplicates(batchTrim(template.match(/{{{[a-zA-Z0-9]*}}}/g), 3, 3));
		readMultiple(keys, readComponent, function(i, file2) {
			txtMap[keys[i]] = file2.replace(/{{{[a-zA-Z0-9]*}}}/g, '');
		}, function() {
			for (var id in txtMap) {
				var i = 1;
				template = template.replace(new RegExp('{{{' + id + '}}}', 'g'), function(m) {
					return '{' + id + '_' + i++ + '|' + txtMap[id] + '}';
				});
			}
			txtMap = {};
			keys = removeDuplicates(batchTrim(template.match(/{{[a-zA-Z0-9]*}}/g), 2, 2));
			readMultiple(keys, readComponentAndData, function(i, file3) {
				component = file3.t.replace(/\\[{}]/g, function(m) { return '\\' + m; });
				component = component.replace(/{{[a-zA-Z0-9]*}}/g, '');
				txtMap[keys[i]] = trpl.process(component, safeParse(file3.d));
			}, function() {
				for (var id in txtMap) {
					template = template.replace(new RegExp('{{' + id + '}}', 'g'), function(m) {
						return txtMap[id];
					});
				}
				if (mode === 'v') {
					success(trpl.process(template, data));
				} else if (mode === 'e') {
					success(wrapEditForm(trpla.process(root === '/pages' ? 'Page Data' : 'Component Data', template, data)));
				} else {
					failure('Invalid Mode');
				}
			});
		});
	});
}

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
	'.gif': 'image/gif',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.bmp': 'image/bmp',
	'.pdf': 'application/pdf',
	'.xml': 'application/xml'
};

http.createServer(function (req, res) {
	var path = url.parse(req.url, true).pathname;
	var extension = path.match(/\.[a-zA-Z]+$/);
	if (!extension) {
		if (path.charAt(path.length - 1) !== '/') {
			res.writeHead(302, {'Location': path + '/'});
			res.end();
		} else {
			var mode = 'v';
			var root = '/pages';
			if (path.indexOf('/a/') === 0) {
				authenticate = true;
				path = path.substring(2);
			}
			if (path.match(/^\/[oesmud]\//g)) {
				mode = path[1];
				path = path.substring(2);
			}
			if (path.match(/^\/[tc]\//g)) {
				if (path[1] === 't') {
					root = '/templates';
				} else if (path[1] === 'c') {
					root = '/components';
				}
				path = path.substring(2, path.length - 1);
			}
			if (mode === "o") {
				var data = '';
		        req.on('data', function (segment) {
		            data += segment;
		        });
		        req.on('end', function () {
		        	if (!data) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(buildOverviewForm());
		        	} else {
						fs.readdir(sysroot + root + path, function(err, files) {
							var children = [];
							if (!err && root === '/pages') {
								var validFiles = [];
								var validPaths = [];
								for (var i = 0; i < files.length; i++) {
									if (!files[i].match(/.*\.(json|txt)$/g)) {
										validFiles.push(files[i]);
										validPaths.push(path + files[i] + '/');
									}
								}
								readMultiple(validPaths, readProps, function(i, file) {
									children.push({"name": validFiles[i], "template": file});
								}, function() {
									res.writeHead(200, {'Content-Type': 'text/plain'});
									res.end(JSON.stringify(children));
								});
							} else {
								if (!err) {
									for (var i = 0; i < files.length; i++) {
										if (files[i].match(/.*\.txt$/g)) {
											children.push({"name": files[i].substring(0, files[i].length - 4)});
										}
									}
								}
								res.writeHead(200, {'Content-Type': 'text/plain'});
								res.end(JSON.stringify(children));
							}
						});
					}
				});
			} else if (mode === "s" || mode === "u") {
				var data = '';
		        req.on('data', function (segment) {
		            data += segment;
		        });
		        req.on('end', function () {
		        	if (data) {
			        	if (mode === "s") {
							fs.writeFile(sysroot + root + (root !== '/pages' ? '/json' : '') + path + (root === '/pages' ? 'page' : '') + '.json', data, function(err) {
								if (!err) {
									res.writeHead(200, {'Content-Type': 'text/plain'});
									res.end('Save Successful');
								} else {
									res.writeHead(404, {'Content-Type': 'text/plain'});
									res.end('Unable to Save');
								}
							});
						} else if (mode === "u") {
							conditionalIntermediary(root === "/pages", function(operation) {
								fs.readdir(sysroot + root + path, function(err, files) {
									conditionalIntermediary(err !== null, function(operation2) {
										fs.mkdir(sysroot + root + path, function(err) {
											operation2();
										});
									}, operation);
								});
							}, function() {
								fs.writeFile(sysroot + root + path + (root === '/pages' ? 'page' : '') + '.txt', data, function(err) {
									if (!err) {
										res.writeHead(200, {'Content-Type': 'text/plain'});
										res.end('Update Successful');
									} else {
										res.writeHead(404, {'Content-Type': 'text/plain'});
										res.end('Unable to Update');
									}
								});
							});
						}
					} else {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end('No Data Recieved');
					}
		        });
			} else if (mode === 'm') {
				if (root === '/pages') {
					fs.readdir(sysroot + '/templates/', function(err, files) {
						var templates = [];
						var template = null;
						for (var i = 0; i < files.length; i++) {
							if (files[i].substring(files[i].length - 4) === '.txt') {
								templates.push(files[i].substring(0, files[i].length - 4));
							}
						}
						fs.readFile(sysroot + root + path + 'page.txt', function(err, file) {
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.end(buildPropsForm(templates, file));
						});
					});
				} else {
					fs.readFile(sysroot + root + path + '.txt', function(err, file) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(buildCodeForm(file ? file.toString() : ''));
					});
				}
			} else if (mode === 'd') {
				if (root === '/pages') {
					fs.unlink(sysroot + root + path + 'page.json', function(err) {
						fs.unlink(sysroot + root + path + 'page.txt', function(err2) {
							fs.rmdir(sysroot + root + path, function(err3) {
								if ((!err || err.errno === 34) && (!err2 || err2.errno === 34) && (!err3 || err3.errno === 34)) {
									res.writeHead(200, {'Content-Type': 'text/plain'});
									res.end(!err || !err2 || !err3 ? 'Delete successful' : 'Nothing to delete');
								} else {
									res.writeHead(404, {'Content-Type': 'text/plain'});
									res.end('Unable to Delete');
								}
							});
						});
					});
				} else {
					fs.unlink(sysroot + root + '/json' + path + '.json', function(err) {
						fs.unlink(sysroot + root + path + '.txt', function(err2) {
							if ((!err || err.errno === 34) && (!err2 || err2.errno === 34)) {
								res.writeHead(200, {'Content-Type': 'text/plain'});
								res.end(!err || !err2 ? 'Delete successful' : 'Nothing to delete');
							} else {
								res.writeHead(404, {'Content-Type': 'text/plain'});
								res.end('Unable to Delete');
							}
						});
					});
				}
			} else {
				processPage(root, path, mode, function(html) {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.end(html);
				}, function(message) {
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end(message);
				});
			}
		}
	} else {
		fs.readFile(sysroot + path, function(err, resourceData) {
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