var xmlhttp = new XMLHttpRequest();
var target = null;
var isPage = false;

var getChildren = function(parentPath) {
	xmlhttp.open('POST', '/o' + parentPath, true);
	xmlhttp.send('true');
};

window.onload = function() {
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			try {
				var targetId = target.parentElement.id;
				var data = JSON.parse(xmlhttp.responseText);
				var html = '';
				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						html += '<div id="' + targetId + data[i].name + '/">' + (isPage ? '<span class="fetch">+</span>' : '') + '<span class="name">' + data[i].name + '</span>' + (data[i].template ? ' : <span class="template">' + data[i].template  + '</span>': '');
						html += ' | <a href="/d' + targetId + data[i].name + '/" target="_blank">Delete</a> | <a href="/m' + targetId + data[i].name + '/" target="_blank">Modify</a> | <a href="/e' + targetId + data[i].name + '/" target="_blank">Edit</a> | <a href="' + targetId + data[i].name + '/" target="_blank">View</a><div class="children"></div></div>';
					}
				} else {
					html = '<span class="message">no children found</span>';
				}
				target.innerHTML = html;
			} catch(e) {};
		}
	}
	if (location.pathname.match(/^\/o\/t\//g)) {
		document.body.children[0].innerHTML = 'Templates';
	} else if (location.pathname.match(/^\/o\/c\//g)) {
		document.body.children[0].innerHTML = 'Components';
	} else {
		isPage = true;
		document.body.children[0].innerHTML = 'Pages';
	}
	var rootPath = location.pathname.substring(2);
	if (rootPath[rootPath.length - 1] !== '/') {
		rootPath += '/';
	}
	document.body.children[1].id = rootPath;
	target = document.body.children[1].getElementsByClassName('children')[0];
	target.onclick = function(event) {
		if (event.target.className === 'fetch') {
			var parent = event.target.parentElement;
			target = parent.getElementsByClassName('children')[0];
			getChildren(parent.id);
			event.target.className = 'fetched';
			event.target.innerHTML = '-';
			parent.className = 'expanded';
		} else if (event.target.className === 'fetched') {
			var parent = event.target.parentElement;
			if (parent.className === 'expanded') {
				event.target.innerHTML = '+';
				parent.className = 'collapsed';
			} else if (parent.className === 'collapsed') {
				event.target.innerHTML = '-';
				parent.className = 'expanded';
			}
		}
	};
	getChildren(document.body.children[1].id);
};