var xmlhttp = new XMLHttpRequest();

window.onload = function() {
	document.getElementById('send').onclick = function(event) {
		var props = {'template':document.getElementById('template').value};
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				console.log(xmlhttp.responseText);
			}
		}
		xmlhttp.open('POST', '/u' + location.pathname.substring(2), true);
		xmlhttp.send(JSON.stringify(props));
	};
};