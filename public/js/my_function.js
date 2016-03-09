var SOCKET_ID;
var USER_NAME;

function my_login(){
	//var socket = io.connect(); // при коннекте создаётся новый сокет ахаха
    var xmlhttp = new XMLHttpRequest();
    var name = document.forms.login.name.value;
    var password = document.forms.login.password.value;

    var body = 'name=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(password) + '&socket_id=' + SOCKET_ID;
    xmlhttp.open("POST", "/static");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xmlhttp.send(body);
    xmlhttp.onreadystatechange = function() {
  		if (xmlhttp.readyState == 4) {
  			var answer = JSON.parse(xmlhttp.responseText);
  			//console.log(answer.status);
  			var log_field = document.getElementById('Div_login');
  			if (answer.status == 'authorize'){
  				log_field.innerHTML = '<font color="green">Добро пожаловать ' + name + '</font>';
  				setTimeout(function(){log_field.remove()}, 5000);
  			} else if (answer.status == 'save new user'){
  				log_field.innerHTML = '<font color="green">Ваш Ник, ' + name + ', зарегистирован</font>';
  				setTimeout(function(){log_field.remove()}, 5000);
  			} else if (answer.status == 'err password'){
  				log_field.innerHTML = '<font color="red">Пароль не соответствует Нику</font>';
  				setTimeout(function(){log_field.innerHTML = '<form name="login"><input type="text" name="name" value="NickName"><input type="password" name="password" value="Secret"><input type="button" name="submit" value="GO" onclick="my_login()"></form>'}, 5000);
  			}  

  		}
  	}
}
