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
				parent.removeChild(parent.children[3]);
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
		for (var i = 4; i < nodes.length; i++) {
			parent.removeChild(nodes[i]);
		}
		parent.removeChild(nodes[3]);
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
					grandparent.insertBefore(controls, parent.nextSibling);
				} else {
					grandparent.insertBefore(controls, parent);
				}
			}
		};
	}
	getChildByClassName(element, "above", "below")[0].onclick = function(event) {
		if (event.target.className) {
			actions[event.target.className](event);
		}
	};
}

var fitText = function(element) {
	var length = element.value.length;
	if (length > 162 || element.value.search(/\n|\r\n/g) > -1) {
		element.className = "largest";
	} else if (length > 54) {
		element.className = "larger";
	} else if (length > 18) {
		element.className = "smaller";
	} else {
		element.className = "smallest";
	}
};

var xmlhttp = new XMLHttpRequest();

window.onload = function() {
	activate(document);
	document.getElementById('send').onclick = function(event) {
		var className = event.target.classname;
		var data = buildData(document.body.children[0]);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				console.log(xmlhttp.responseText);
			}
		}
		xmlhttp.open('POST', '/s' + location.pathname.substring(2), true);
		xmlhttp.send(JSON.stringify(data));
	};
};