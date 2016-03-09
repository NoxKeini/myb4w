"use strict"
/*Описание работы сокетов
При коннекте новый участник запрашивает свойства текущих участников событием check. 
Участники отвечают на запрос событием check_ansver, передавая свои свойства и вызывая событие user_update, которое отображает 
участников на сцене нового уастника.
*/
// register the application module
b4w.register("my_socket", function(exports, require) {    
exports.init = function() {
var m_app  = require("app");
var m_scenes = require("scenes");
var m_transform = require("transform");
var m_my_function = require("my_function");
var m_quat = require('quat');

var socket = io.connect();
var USER_NAME;

m_app.enable_controls();
//m_app.enable_camera_controls(); //контроль камеры
var socket = io.connect();

socket.on('new_user_auth', function(){
    console.log('Пользователь авторизовался');
    var socket_id = arguments[0].socket_id;
    var model_name = arguments[0].model_name;
    var name = arguments[0].name;
    var pos = arguments[0].position;
    m_my_function.remove_obj_by_socket_id(socket_id);
    if (name != USER_NAME) m_my_function.create_obj(name, model_name, pos, socket_id);
});

socket.on('loading_db', function(){
    var socket_id = SOCKET_ID;
    var name = arguments[0].data.name;
    var pos = [arguments[0].data.position.x,arguments[0].data.position.y,arguments[0].data.position.z];
    var model_name = arguments[0].data.model_name;
    m_scenes.remove_object(m_scenes.get_object_by_name(USER_NAME, m_scenes.DATA_ID_ALL));
    USER_NAME = name;
    m_my_function.create_obj(name, model_name, pos, socket_id);
});

/*socket.on('check', function () {//агрументом является юзер ид пользователя, который подконнектился
    console.log('Запрос объекта от нового юзера');
    var avatar = m_scenes.get_object_by_name(USER_NAME,m_scenes.DATA_ID_ALL);
    var data = {
        model_name: avatar.model_name,//имя модели
        name: avatar.name,//имя объекта
        pos: m_transform.get_translation(avatar)//коорднаты объекта  
    };
    //console.log(data);
    socket.emit('check_ansver',{'data':data,'socket_id':arguments[0].socket_id});
});*/

socket.on('set_old_users', function () {
    console.log('Добавление существующих юзеров');
    var name = arguments[0].data.data.name;
    var pos = arguments[0].data.data.pos;       
    var socket_id = arguments[0].socket_id;
    var model_name = arguments[0].data.data.model_name;
    var quat = arguments[0].data.data.quat;
    m_my_function.create_obj(name, model_name, pos, socket_id, quat);
});

socket.on('connect', function () { //реакция на событие коннекта пользователя
	var socket_id = '/#'+socket.id;
    //var model_name = "character_box";
    var model_name = "my_drone";
    var name = "user" + Math.random();
    var pos = [Math.random()*3,2,Math.random()*3];
    //var pos = [0,2,0];  
    USER_NAME = name;
    console.log('Ваше имя' + USER_NAME);
    SOCKET_ID = socket_id;                 
    //m_my_function.create_obj(name, model_name, pos, socket_id);
    m_my_function.create_character(name, model_name, pos, socket_id);
    socket.emit('get_new_user',{model_name,name,pos});
});   

socket.on('user_move', function(){
    var field_nickname;
    var name_field_nickname;
	var socket_id = arguments[0].data.data.socket_id;
	var pos = arguments[0].data.data.cord;
    var quat = arguments[0].data.data.quat;
    var obj_list = m_scenes.get_all_objects();
    for(var i = 0; i < obj_list.length; i++){
        if (obj_list[i].socket_id == socket_id){
            m_transform.set_translation(obj_list[i], pos[0], pos[1], pos[2]); 
            m_transform.set_rotation_v(obj_list[i], quat);
        }
    }
});

socket.on('set_new_user', function(){
    var name = arguments[0].data.name;
    var pos = arguments[0].data.pos;
    var model_name = arguments[0].data.model_name;               
    //var avatar_source;
    var socket_id = arguments[0].socket_id;
    //var obj_list = m_scenes.get_all_objects();
    m_my_function.create_obj(name, model_name, pos, socket_id);

    var obj = m_scenes.get_object_by_name(USER_NAME,m_scenes.DATA_ID_ALL);
    var data = {
        model_name: obj.model_name,//имя модели
        name: obj.name,//имя объекта
        pos: m_transform.get_translation(obj),//коорднаты объекта
        quat: m_transform.get_rotation(obj, m_quat.create())  
    };    
    socket.emit('get_old_users',{'data':data,'socket_id':arguments[0].socket_id});      
});

socket.on('user_disconnect', function () { //реакция на событие дисконнекта пользователя
    var socket_id = arguments[0].socket_id ; //сокет ид пользователя, который отдисконнектился
    m_my_function.remove_obj_by_socket_id(socket_id);
});

socket.on('disconnect', function(){
    var obj_list = m_scenes.get_all_objects();
    for (var i = 0; i < obj_list.length; i++){
        if (obj_list[i].name != 'Sun' && obj_list[i].name != 'Camera' && obj_list[i].name != '%meta_sky%0' && obj_list[i].name != 'Plane'){
            m_scenes.remove_object(obj_list[i]);
        }
    }
});
exports.move = function(socket_id, cord, quat){
var data = {
   socket_id: socket_id,
   cord: cord,
   quat: quat 
};    
socket.emit('move',{'data':data});
}
}
});

