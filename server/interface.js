var overlay = 
	loginContainer = 
	structure = 
	workspace = 
	tabs = 
	sheets = 
	view = 
	username = 
	session = 
	key = 
	structureAnimationTimeout = null,
	xmlhttp = new XMLHttpRequest(),
	structureMinWidth = 200,
	structureMaxWidth = 400,
	structureTypes = {
		'templates': 'template',
		'components': 'component',
		'images': 'image',
		'files': 'file',
		'css': 'style sheet',
		'js': 'script'
	},
	animateStructureExpanding = function(width) {
		structureAnimationTimeout = setTimeout(function() { animateStructureExpanding(width + 20); }, 16);
		structure.style.width = (width - 25) + 'px';
		workspace.style.left = width + 'px';
	},
	animateStructureCollapsing = function(width) {
		structureAnimationTimeout = setTimeout(function() { animateStructureCollapsing(width - 20); }, 16);
		structure.style.width = (width - 25) + 'px';
		workspace.style.left = width + 'px';
	};

var q = {
	remove: function(element) {
		var parent = element.parentElement;
		parent.removeChild(element);
		return parent;
	},
	insertBefore: function(newElement, existingElement) {
		existingElement.parentElement.insertBefore(newElement, existingElement);
	}
};

var liftId = function(element) {
	var id = element.id;
	element.id = '';
	return id;
};
var liftValue = function(input) {
	var value = input.value;
	input.value = '';
	return value;
};
var setStructureInput = function(element, type, extension) {
	if (element && element.className === 'message') {
		var input = element.getElementsByTagName('input')[0];
		var id = liftId(element);
		var html = '<span class="' + (type === 'folder' ? 'label' : 'name') + '">' + (input ? liftValue(input) : 'Home Page');
		if (type === 'file') {
			html += extension + '</span><span class="options-collapsed">&or;</span>' +
				'<div class="children"><div class="message"><a href="#">delete</a> this ' + (id.match(/^images\//g) ? 'image' : 'file') + '</div></div>'
		} else {
			html += '</span>' + (extension ? ' : <span class="template">' + extension + '</span>' : '') + '<span class="fetch">+</span>';
		}
		if (type === 'homepage') {
			element.className = '';
			element.innerHTML = html;
		} else {
			var newElement = document.createElement('div');
			if (extension && type === 'file') {
				newElement.id = id.substring(0, id.length - 1) + extension;
			} else {
				newElement.id = id;
			}
			newElement.innerHTML = html;
			q.insertBefore(newElement, element);
			updateFolderState(element.parentElement.parentElement);
		}
	}
};
var updateFolderState = function(folder) {
	if (folder) {
		var container = folder.getElementsByClassName('children')[0];
		var deleteButton = container.getElementsByClassName('delete-message')[0];
		var children = container.children;
		var allMessages = true;
		for (var i = 0; i < children.length; i++) {
			if (children[i].className !== 'message') {
				allMessages = false;
			}
		}
		if (allMessages && !deleteButton && (folder.parentElement !== structure || !folder.id)) {
			deleteButton = document.createElement('div');
			deleteButton.className = 'delete-message';
			deleteButton.innerHTML = 'no children found &nbsp;|&nbsp; <a href="#">delete</a> this ' + (structureTypes[(folder.id || '').split('/')[0]] || 'page') + '</div>';
			q.insertBefore(deleteButton, children[0]);
		} else if (!allMessages && deleteButton) {
			q.remove(deleteButton);
		}
	}
};

window.onload = function() {
	overlay = document.getElementById('overlay');
	loginContainer = document.getElementById('login-container');
	tabs = document.getElementById('tabs');
	sheets = document.getElementById('sheets');
	view = document.getElementById('view');
	structure = document.getElementById('structure');
	workspace = document.getElementById('workspace');
	structure.style.width = (structureMinWidth - 25) + 'px';
	workspace.style.left = structureMinWidth + 'px';
	var structureExpanded = false;
	var timeout = null;
	window.onmousemove = function(event) {
		if (timeout === null) {
			if (!structureExpanded && event.x < structureMinWidth) {
				structureExpanded = true;
				clearTimeout(timeout);
				clearTimeout(structureAnimationTimeout);
				timeout = setTimeout(function() {
					clearTimeout(structureAnimationTimeout);
					timeout = null;
					structure.style.width = (structureMaxWidth - 25) + 'px';
					workspace.style.left = structureMaxWidth + 'px';
					structure.className = 'expanded';
				}, 144);
				animateStructureExpanding(parseInt(structure.style.width.replace('px', '')) + 20);
			} else if (structureExpanded && event.x > window.innerWidth - structureMinWidth) {
				structureExpanded = false;
				clearTimeout(timeout);
				clearTimeout(structureAnimationTimeout);
				timeout = setTimeout(function() {
					clearTimeout(structureAnimationTimeout);
					timeout = null;
					structure.style.width = (structureMinWidth - 25) + 'px';
					workspace.style.left = structureMinWidth + 'px';
					structure.className = 'collapsed';
				}, 144);
				animateStructureCollapsing(parseInt(structure.style.width.replace('px', '')) - 20);
			}
		}
	};
	structure.onclick = function(event) {
		var target = event.target;
		if (target !== structure) {
			if (target.nodeName.toLowerCase() !== 'a') {
				var action = target.className;
				var parent = target.parentElement;
				var category = parent.id.match(/^(images|files)\//g) ? 'imageOrFile' : parent.id.match(/^(css|js)\//g) ? 'cssOrJs' : 'other';
				if (action === 'fetch') {
					get('/o/' + parent.id, function(data) {
						target.className = 'expanded';
						target.innerHTML = '-';
						var root = parent.id.split('/')[0];
						var type = structureTypes[root] || 'page';
						var html = '';
						if (data.folders.length || data.files.length) {
							for (var i = 0; i < data.folders.length; i++) {
								html += '<div id="' + parent.id + data.folders[i].name + '/"><span class="' + (parent.id.match(/(images|files)/g) ? 'label' : 'name') + '">' + data.folders[i].name + '</span>' + 
									(data.folders[i].template !== '' ? ' : <span class="template">' + data.folders[i].template  + '</span>' : '') + '<span class="fetch">+</span></div>';
							}
							if (category === 'imageOrFile') {
								html += '<div class="message"><input type="text" /> <a href="#">create</a> new folder</div>';
							}
							for (var i = 0; i < data.files.length; i++) {
								html += '<div id="' + parent.id + data.files[i].name + '"><span class="name">' + data.files[i].name + '</span>' + 
									'<span class="options-collapsed">&or;</span><div class="children"><div class="delete-message"><a href="#">delete</a> this ' + type + '</div></div></div>';
							}
						} else {
							if (parent.parentElement !== structure || parent.getElementsByClassName('name').length > 0) {
								html = '<div class="delete-message">no children found &nbsp;|&nbsp; <a href="#">delete</a> this ' + type + '</div>';
							}
							if (category === 'imageOrFile') {
								html += '<div class="message"><input type="text" /> <a href="#">create</a> new folder</div>';
							}
						}
						if (category === 'imageOrFile') {
							html += '<div class="message"><input type="text" /> <a href="#">upload</a> new ' + type + '</div>';
						} else {
							html += '<div class="message"><input type="text" /> <a href="#">create</a> new ' + type + '</div>';
						}
						parent.innerHTML += '<div class="children">' + html + '</div>';
					});
				} else if (action === 'expanded') {
					target.innerHTML = '+';
					target.className = 'collapsed';
				} else if (action === 'collapsed') {
					target.innerHTML = '-';
					target.className = 'expanded';
				} else if (action === 'options-expanded') {
					target.innerHTML = '&or;';
					target.className = 'options-collapsed';
				} else if (action === 'options-collapsed') {
					target.innerHTML = '&and;';
					target.className = 'options-expanded';
				} else if (action === 'name') {
					if (category === 'imageOrFile') {
						activateTabAndSheet('modify', target.innerHTML, '/u/' + parent.id.replace(/\.[a-zA-Z0-9]+$/g, '/'), function(sheet) {
							sheet.innerHTML = '<iframe frameborder="0" width="100%" height="100%" src="' + insertSession('/m/' + parent.id) + '"></iframe>';
						});
					} else if (category === 'cssOrJs') {
						get('/m/' + parent.id, function(data) {
							activateTabAndSheet('modify', target.innerHTML, '/u/' + parent.id, function(sheet) {
								sheet.innerHTML = data;
								activate(sheet);
							});
						});
					} else {
						get('/e/' + parent.id, function(data) {
							activateTabAndSheet('edit', target.innerHTML, '/s/' + parent.id, function(sheet) {
								sheet.innerHTML = data;
								activate(sheet);
							});
						});
					}
				} else if (action === 'template') {
					get('/m/' + (parent.id || ''), function(data) {
						activateTabAndSheet('modify', target.parentElement.getElementsByClassName('name')[0].innerHTML, '/u/' + (parent.id || ''), function(sheet) {
							sheet.innerHTML = data;
						});
					});
				} else if (action === 'label') {
					target.nextSibling.click();
				}
			} else {
				var action = target.innerHTML;
				target = target.parentElement;
				var parent = target.parentElement.parentElement;
				var category = parent.id.match(/^(images|files)\//g) ? 'imageOrFile' : parent.id.match(/^(css|js)\//g) ? 'cssOrJs' : 'other';
				if (action === 'delete') {
					get('/d/' + parent.id, function(data) {
						if (parent.id === '') {
							parent.className = 'message';
							parent.innerHTML = '<a href="#">create</a> home page';
						} else {
							updateFolderState(q.remove(parent).parentElement);
						}
					});
				} else {
					var input = target.getElementsByTagName('input')[0];
					if (!input && action === 'create') {
						get('/m/', function(data) {
							activateTabAndSheet('modify', 'Home Page', '/u/', function(sheet) {
								sheet.innerHTML = data;
							});
							tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
						});
					} else {
						var name = input.value;
						if (action === 'create') {
							if (name !== '' && name.indexOf(' ') === -1) {
								target.id = parent.id + name + '/';
								if (category === 'imageOrFile') {
									get('/u/' + target.id, function(data) {
										setStructureInput(target, 'folder');
									});
								} else if (!parent.id.match(/^(templates|components)\/.+/g)) {
									get('/m/' + target.id, function(data) {
										activateTabAndSheet('modify', name, '/u/' + target.id, function(sheet) {
											sheet.innerHTML = data;
										});
										tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
									});
								} else {
									get('/e/' + target.id, function(data) {
										activateTabAndSheet('edit', name, '/s/' + target.id, function(sheet) {
											sheet.innerHTML = data;
											activate(sheet);
										});
										tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
									});
								}
							}
						} else if (action === 'upload') {
							if (name !== '' && name.indexOf(' ') === -1) {
								target.id = parent.id + name + '/';
								activateTabAndSheet('modify', name, '/u/' + target.id, function(sheet) {
									sheet.innerHTML = '<iframe frameborder="0" width="100%" height="100%" src="' + insertSession('/m/' + target.id) + '"></iframe>';
								});
								tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
							}
						}
					}
				}
				return false;
			}
		}
	};
	structure.onkeydown = function(event) {
		if (event.which === 13 && event.target.nodeName.toLowerCase() === 'input') {
			event.target.parentElement.getElementsByTagName('a')[0].click();
		}
	};
	tabs.onclick = function(event) {
		if (event.target.className === 'close') {
			closeTab(event.target.parentElement);
		} else if (event.target.nodeName.toLowerCase() === 'span') {
			focusTab(event.target);
		}
	};
	sheets.onclick = function(event) {
		if (event.target.parentElement && event.target.parentElement.className === 'templates' && event.target.className !== 'current') {
			var current = event.target.parentElement.getElementsByClassName('current');
			if (current.length > 0) {
				current[0].className = '';
			}
			event.target.className = 'current';
			tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
		}
		if (event.target.className === 'add' || event.target.className === 'remove' || event.target.nodeName.toLowerCase() === 'select') {
			tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
		}
	};
	sheets.onkeydown = function(event) {
		if (sheets.className === 'modify') {
			var target = event.target;
			if (event.which === 9) {
				var start = target.selectionStart;
				var end = target.selectionEnd;
				target.value = target.value.substring(0, start) + '\t' + target.value.substring(end);
				target.selectionStart = start + 1;
				target.selectionEnd = start + 1;
				event.preventDefault();
			}
		}
		if (event.which !== 9 && event.which !== 20 && event.target.nodeName.toLowerCase() === 'textarea') {
			tabs.getElementsByClassName('active')[0].getElementsByClassName('close')[0].innerHTML = '!';
		}
	};
	loginContainer.onkeydown = function(event) {
		if (event.which === 13) {
			authenticate();
		}
	};
	view.onclick = function(event) {
		if (view.href === location + '#') {
			return false;
		}
	};
	window.onkeydown = function(event) {
		handleSpecialKeys(event);
	};
	loginContainer.getElementsByTagName('input')[0].focus();
};

var handleSpecialKeys = function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
	        case 's':
	            event.preventDefault();
	            saveActive();
	            break;
		}
	}
};

var closeTab = function(tab) {
	var newActive = tab.className === 'active' ? tab.previousSibling || tab.nextSibling : null;
	var sheet = document.getElementById(tab.id.substring(1));
	var file = document.getElementById(tab.id.substring(4));
	if (file && file.className === 'message') {
		file.getElementsByTagName('input')[0].value = '';
	}
	q.remove(tab);
	q.remove(sheet);
	if (newActive) {
		focusTab(newActive);
	}
}

var focusTab = function(tab) {
	clearActive();
	var sheet = document.getElementById(tab.id.substring(1));
	if (tab.id.indexOf('//u/') === 0) {
		sheets.className = 'modify';
		if (tab.id.indexOf('//u/templates/') === 0 || tab.id.indexOf('//u/components/') === 0) {
			sheet.getElementsByTagName('textarea')[0].focus();
		}
	} else if (tab.id.indexOf('//s/') === 0) {
		sheets.className = 'edit';
	}
	tab.className = 'active';
	sheet.className = 'active';
	view.href = insertSession(tab.id.substring(3));
};

var activateTabAndSheet = function(type, label, id, loader) {
	sheets.className = type;
	var sheet = document.getElementById(id);
	if (!sheet) {
		sheet = document.createElement('div');
		sheet.id = id;
		sheets.appendChild(sheet);
		loader(sheet);
	}
	var tab = document.getElementById('/' + id);
	if (!tab) {
		tab = document.createElement('span');
		tab.id = '/' + id;
		tab.innerHTML = type + ' - ' + label + '<span class="close">X</span>';
		tabs.appendChild(tab);
	}
	focusTab(tab);
};

var submitUploadForm = function(form) {
	form.submit();
	return false;
};

var uploadSuccess = function(path, extension) {
	document.getElementById('//u' + path).getElementsByClassName('close')[0].innerHTML = 'X';
	setStructureInput(document.getElementById(path.substring(1)), 'file', extension);
};

var saveActive = function() {
	var tab = tabs.getElementsByClassName('active')[0];
	var sheet = sheets.getElementsByClassName('active')[0];
	var sheetId = sheet.id.replace(/\.[a-zA-Z0-9]+$/g, '/');
	if (tab) {
		if (sheetId.indexOf('/s/') === 0) {
			post(sheetId, buildData(sheet.children[0]), function(data) {
				setStructureInput(document.getElementById(tab.id.substring(4)), 'node', '');
				tab.getElementsByClassName('close')[0].innerHTML = 'X';
			});
		} else if (sheetId.indexOf('/u/') === 0) {
			var type = sheetId.substring(3).split('/')[0];
			if (type.match(/^(templates|components|css|js)$/g)) {
				var file = document.getElementById(tab.id.substring(4));
				var parent = file.parentElement.parentElement;
				if (type.match(/^(templates|components)$/g)) {
					post(sheetId, sheet.getElementsByTagName('textarea')[0].value, function(data) {
						setStructureInput(file, 'node', parent.id.match(/^(templates\/|components\/)$/) ? 'code' : '');
						tab.getElementsByClassName('close')[0].innerHTML = 'X';
					});
				} else {
					post(sheetId, sheet.getElementsByTagName('textarea')[0].value, function(data) {
						setStructureInput(file, 'file', '.' + parent.id.split('/')[0]);
						tab.getElementsByClassName('close')[0].innerHTML = 'X';
					});
				}
			} else if (type.match(/^(images|files)$/g)) {
				uploadFunctions[sheetId.substring(2)](insertSession(sheetId));
			} else {
				var current = sheet.children[0].getElementsByClassName('templates')[0].getElementsByClassName('current');
				if (current.length > 0) {
					var template = current[0].innerHTML;
					post(sheetId, template, function(data) {
						if (tab.id.length === 4) {
							setStructureInput(structure.children[0], 'homepage', template);
						} else {
							setStructureInput(document.getElementById(tab.id.substring(4)), 'node', template);
						}
						tab.getElementsByClassName('close')[0].innerHTML = 'X';
					});
				}
			}
		}
	}
};

var clearActive = function() {
	var tab = tabs.getElementsByClassName('active');
	for (var i = 0; i < tab.length; i++) {
		tab[i].className = '';
	}
	var sheet = sheets.getElementsByClassName('active');
	for (var i = 0; i < sheet.length; i++) {
		sheet[i].className = '';
	}
};

var authenticate = function() {
	var username = document.getElementById('username');
	var password = document.getElementById('password');
	setUpResponseHandler(function(data) {
		session = data;
		overlay.style.display = 'none';
		loginContainer.style.display = 'none';
		username.value = '';
		password.value = '';
		loginContainer.children[0].className = '';
		loginContainer.children[3].className = '';
	}, function(data) {
		loginContainer.children[0].className = 'error';
		loginContainer.children[3].className = 'error';
	});
	xmlhttp.open('POST', '/a/', true);
	xmlhttp.send('{"username":"' + username.value + '","password":"' + password.value + '"}');
};

var insertSession = function(path) {
	var prefix = path.match(/^\/([oesmud]\/)?([tc]\/)?/g)[0];
	if (session === null || prefix !== '/') {
		return prefix + session + path.substring(prefix.length - 1);
	} else {
		return path;
	}
};

var setUpResponseHandler = function(success, failure) {
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var json = JSON.parse(xmlhttp.responseText);
			if (json.success === null) {
				showLogin();
			} else if (json.success && success !== undefined) {
				success(json.data);
			} else if (!json.success && failure !== undefined) {
				failure(json.data);
			}
		}
	}
};

var get = function(path, success, failure) {
	setUpResponseHandler(success, failure);
	xmlhttp.open('GET', insertSession(path), true);
	xmlhttp.send();
};

var post = function(path, data, success, failure) {
	setUpResponseHandler(success, failure);
	xmlhttp.open('POST', insertSession(path), true);
	xmlhttp.send(typeof data === 'string' ? data : JSON.stringify(data));
};

var showLogin = function() {
	loginContainer.getElementsByTagName('input')[0].focus();
	loginContainer.style.display = 'block';
	overlay.style.display = 'block';
};

var buildData = function(element) {
	if (element.className === "string") {
		return element.getElementsByTagName("textarea")[0].value;
	} else if (element.className === "object") {
		var object = {};
		var nodes = element.children;
		for (var i = 1; i < nodes.length; i++) {
			object[nodes[i].children[0].innerHTML] = buildData(nodes[i]);
		}
		return object;
	} else if (element.className === "array") {
		var array = [];
		var nodes = element.children;
		for (var i = 2; i < nodes.length; i++) {
			if (nodes[i].className !== "above" && nodes[i].className !== "below") {
				array.push(buildData(nodes[i]));
			}
		}
		return array;
	}
	return null;
};

var activate = function(element) {
	var textareas = element.getElementsByTagName("textarea");
	for (var i = 0; i < textareas.length; i++) {
		fitText(textareas[i]);
		var timeout = undefined;
		textareas[i].onkeydown = function(event) {
			if (!timeout) {
				timeout = setTimeout(function() { fitText(event.target); timeout = clearTimeout(timeout); }, 400);
			}
		};
	}
	var arrays = element.getElementsByClassName("array");
	if (element.className === "array") {
		activateArrays(element);
	}
	for (var i = 0; i < arrays.length; i++) {
		activateArrays(arrays[i]);
	}
};

var firstTextArea = function(element) {
	if (element.className === "string") {
		return element.children[1];
	} else if (element.className === "object") {
		return firstTextArea(element.children[1])
	} else if (element.className === "array") {
		return firstTextArea(element.children[2])
	}
}

var actions = {
	flip: function(event) {
		var controls = event.target.parentElement;
		if (controls.className === "above") {
			controls.className = "below";
			controls.getElementsByClassName("add")[0].innerHTML = "Add Element Below";
			controls.getElementsByClassName("remove")[0].innerHTML = "Remove Element Below";
		} else {
			controls.className = "above";
			controls.getElementsByClassName("add")[0].innerHTML = "Add Element Above";
			controls.getElementsByClassName("remove")[0].innerHTML = "Remove Element Above";
		}
	},
	add: function(event) {
		var parent = event.target.parentElement;
		var nodes = parent.parentElement.children;
		var newNode = null;
		if (parent.children.length > 4) {
			restore[parent.className](parent);
			if (parent.children.length > 4) {
				parent.children[3].innerHTML = "Clear (" + (parent.children.length - 4) + ")";
			} else {
				q.remove(parent.children[3]);
			}
		} else {
			newNode = insert[parent.className](parent, nodes[1].innerHTML)[0];
			activate(newNode);
		}
		if (newNode) {
			firstTextArea(newNode).focus();
		}
		reindex(nodes);
	},
	remove: function(event) {
		var parent = event.target.parentElement;
		if (parent.className === "above" && parent.previousSibling.className !== "blank" || parent.className === "below" && parent.nextSibling) {
			var nodes = parent.parentElement.children;
			remove[parent.className](parent);
			var clear = parent.children[3];
			if (!clear || clear.className !== "clear") {
				clear = insert["below"](parent.children[2], "<span class=\"clear\">Clear</span>")[0];
			}
			clear.innerHTML = "Clear (" + (parent.children.length - 4) + ")";
			reindex(nodes);
		}
	},
	clear: function(event) {
		var parent = event.target.parentElement;
		var nodes = parent.children;
		var count = nodes.length;
		for (var i = 0; i < count - 3; i++) {
			q.remove(nodes[3]);
		}
	}
};

var insert = {
	above: function(node, html) {
		var parent = node.parentElement;
		var holder = document.createElement('div');
		holder.innerHTML = html;
		var children = holder.childNodes;
		var newNodes = [];
		for (var i = 0; i < children.length; i++) {
			newNodes.push(parent.insertBefore(children[i], node));
		}
		return newNodes;
	},
	below: function(node, html) {
		var parent = node.parentElement;
		var holder = document.createElement('div');
		holder.innerHTML = html;
		var children = holder.childNodes;
		var newNodes = [];
		for (var i = children.length - 1; i >= 0; i--) {
			if (node.nextSibling) {
				newNodes.push(parent.insertBefore(children[i], node.nextSibling));
			} else {
				newNodes.push(parent.appendChild(children[i]));
			}
		}
		return newNodes;
	}
};

var remove = {
	above: function(node) {
		if (node.previousSibling.className !== "blank") {
			node.appendChild(node.previousSibling);
		}
	},
	below: function(node) {
		if (node.nextSibling) {
			node.appendChild(node.nextSibling);
		}
	}
};

var restore = {
	above: function(node) {
		var newNode = node.children[node.children.length - 1];
		node.parentElement.insertBefore(newNode, node);
		return newNode;
	},
	below: function(node) {
		var newNode = node.children[node.children.length - 1];
		node.parentElement.insertBefore(newNode, node.nextSibling);
		return newNode;
	}
};

var reindex = function(elements) {
	var adjustment = -1;
	for (var i = 2; i < elements.length; i++) {
		if (elements[i].className !== "above" && elements[i].className !== "below") {
			elements[i].children[0].innerHTML = i + adjustment;
		} else {
			adjustment = -2;
		}
	}
};

var getChildByClassName = function(element) {
	var children = element.children;
	var matches = [];
	for (var i = 0; i < children.length; i++) {
		for (var j = 1; j < arguments.length; j++) {
			if (children[i].className === arguments[j]) {
				matches.push(children[i]);
			}
		}
	}
	return matches;
};

var activateArrays = function(element) {
	var children = element.children;
	for (var i = 2; i < children.length; i++) {
		children[i].children[0].onclick = function(event) {
			if (event.target.className !== "flip") {
				var parent = event.target.parentElement;
				var grandparent = parent.parentElement;
				var controls = getChildByClassName(grandparent, "above", "below")[0];
				if (controls.className === "above") {
					q.insertBefore(controls, parent.nextSibling);
				} else {
					q.insertBefore(controls, parent);
				}
			}
		};
	}
	getChildByClassName(element, "above", "below")[0].onclick = function(event) {
		var className = event.target.className;
		if (className && className !== 'above' && className !== 'below') {
			actions[event.target.className](event);
		}
	};
};

var fitText = function(element) {
	var length = element.value.length;
	if (length > 243 || element.value.search(/\n|\r\n/g) > -1) {
		element.className = "largest";
	} else if (length > 81) {
		element.className = "larger";
	} else if (length > 27) {
		element.className = "smaller";
	} else {
		element.className = "smallest";
	}
};