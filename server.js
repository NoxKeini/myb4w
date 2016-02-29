var http = require('http');
var connect = require('connect');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var app = connect()
	.use(serveStatic(__dirname + '/public', {'index': ['my_test_dev.html']}))
	.use(morgan('dev'))
	.use(favicon(__dirname + '/public/my_favicon.png'))
	.use(cookieParser())
	.use(cookieSession({
	  name: 'session',
	  keys: ['key1', 'key2'],
	  maxAge: 5*60*1000
	}))	
var server = http.createServer(app);
var io = require('socket.io')(server);
/*Описание работы сокетов
Приконнекте новый участник запрашивает свойства текущих участников событием check. 
Участники отвечают на запрос событием check_ansver, передавая свои свойства и вызывая событие user_update, которое отображает 
участников на сцене нового уастника.
*/
io.on('connection', function (socket){
	socket.broadcast.emit('check',{'socket_id':socket.id});
	socket.on('check_ansver', function (){
		io.to(arguments[0].socket_id).emit('user_update',{'data':arguments[0], 'socket_id':socket.id});
	});
	socket.on('new_user', function(){
		socket.broadcast.emit('add_new_user',{'data':arguments[0], 'socket_id':socket.id});
	})
	socket.on('disconnect', function (){
		socket.broadcast.emit('user_disconnect',{'socket_id':socket.id});
	});
	socket.on('move', function (){
		socket.broadcast.emit('user_move',{'data':arguments});
	});		
});

server.listen(process.env.PORT || 3000);