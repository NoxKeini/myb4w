var http = require('http');
var connect = require('connect');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var connectRoute = require('connect-route');
var bodyParser = require('body-parser')
var async = require('async');
var db = require('./models');
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
 	.use(bodyParser.urlencoded({ extended: false }))
	.use(connectRoute(function (router) {
	router.post('/static', function (req, res, next) {
		async.waterfall([async.apply(login, req.body.name, req.body.password)],
			function (err, result){
				//console.log(result.status);
				res.end(JSON.stringify(result));
				if (result.status == 'authorize'){
					io.sockets.connected[req.body.socket_id].emit('loading_db',{'data': result});
					io.sockets.emit('new_user_auth',{'socket_id': req.body.socket_id,
						'model_name': result.model_name, 'name': result.name, 'position': result.position});
					user_list[req.body.socket_id] = result.name;					
				}
			}
		);
	});
	}))

var server = http.createServer(app);
var io = require('socket.io')(server);

var user_list = {}; 

io.on('connection', function (socket){
	
	socket.on('get_old_users', function (){
		io.to(arguments[0].socket_id).emit('set_old_users',{'data':arguments[0], 'socket_id':socket.id});
		//console.log(arguments[0].socket_id, socket.id);
	});
	socket.on('get_new_user', function(){
		socket.broadcast.emit('set_new_user',{'data':arguments[0], 'socket_id':socket.id});
		user_list[socket.id] = arguments[0].name;
		//socket.broadcast.emit('check',{'socket_id':socket.id});
		//console.log(user_list);
	})
	socket.on('disconnect', function (){
		socket.broadcast.emit('user_disconnect',{'socket_id':socket.id});
		for (prop in user_list){
			if (prop == socket.id){
				delete user_list[prop];
			}
		}
	});
	socket.on('move', function (){
		socket.broadcast.emit('user_move',{'data':arguments[0]});
	});	
});

db.sequelize.sync({
	//logging: console.log, //выводит в консоль полезные данные
	//force: true //перезаписывает таблицы, важный элемент
})
.then(function() {
	server.listen(process.env.PORT || 3000);
})

function login(name, password, callback){
	db.User.findOne({where:{username : name}})
	.then(function(project) {
		//console.log(project);
		if (project == null) {
			var user = db.User.build({
				username: name,
				password: password
			}).save();
			var answer = {
				'status': 'save new user'
			}			
			callback(null, answer);
		}else if (project.password != password){
			var answer = {
				'status': 'err password'
			}
			callback(null, answer);
		}else if (project.password == password && name_dubl() == false){
			var answer = {
				'status': 'authorize',
				'name': project.username,
				'position': project.position,
				'model_name': project.model_name
			}
			callback(null, answer);
		}
	})	
	.catch(function(error){
		//console.log(error)
	})
	function name_dubl(){
		var k = 0;
		for (prop in user_list){
			k++;
			console.log(user_list[prop], name);
			if (user_list[prop] == name){
				console.log('пользователь с таким Ником уже залогинен');
				return true;
			}else if (k == Object.keys(user_list).length){
				console.log('пользователя с таким Ником ещё нет онлайн');
				return false;
			};
		}			
	};
	//db.User.findAll({where:{username : name}}).then(function(project) {console.log(project)});		
}

