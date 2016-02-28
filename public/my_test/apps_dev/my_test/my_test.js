"use strict"

// register the application module
b4w.register("my_test", function(exports, require) {

// import modules used by the app
var m_app  = require("app");
var m_cfg  = require("config");
var m_data = require("data");
var m_ver  = require("version");
var m_scenes = b4w.require("scenes");
var m_controls = b4w.require("controls");
var m_transform = b4w.require("transform");
var m_objects = require('objects');

// detect application mode
var DEBUG = (m_ver.type() === "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "my_test/"; //в дальнейшем путь был исправлен мной в связи с перемещением основного файла приложения в папку public

var USER_NAME;
/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true
    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    load();
}

/**
 * load the scene data
 */
function load() {
    APP_ASSETS_PATH = '/my_test/deploy/assets/my_test/'
    m_data.load(APP_ASSETS_PATH + "my_test.json", load_cb);   
    //console.log(APP_ASSETS_PATH + "my_test.json");
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }

    m_app.enable_controls();
    //m_app.enable_object_controls(m_scenes.get_object_by_name("Cube"));
    //m_app.enable_camera_controls();

/*
    //Передача координат объекта при перемещении в сокет
    var cube = m_scenes.get_object_by_name("Cube");
    var sensor_motion_cube = m_controls.create_motion_sensor(cube);
    // array of the sensors
    var impact_sens_array = [sensor_motion_cube];
    // manifold logic function
    var impact_sens_logic = function(s) {
        return (s[0])
    };
    // callback
    var impact_cb = function(obj, manifold_id, pulse) {
        var cord_cube = m_transform.get_translation(cube);
        //console.log(cord_cube);
        socket.emit('move', cord_cube);
    }
    //создание sensor_manifold   
    m_controls.create_sensor_manifold(cube, "IMPACT", m_controls.CT_CONTINUOUS, impact_sens_array, impact_sens_logic, impact_cb);
*/
	
	

    var socket = io.connect();



    socket.on('check', function () {
        var avatar = m_scenes.get_object_by_name(USER_NAME,m_scenes.DATA_ID_ALL);
        var data = {};
        data.type = avatar.type;//тип объекта
        data.name = avatar.name;//имя объекта
        data.pos = m_transform.get_translation(avatar);//коорднаты объекта
        socket.emit('check_ansver',{'data':data,'socket_id':arguments[0].socket_id});
    });

    socket.on('user_update', function () {
        var data = arguments[0].data;
        var socket_id = arguments[0].socket_id;
        //console.log(data, socket_id);
        var avatar_source;
        var model_path = '/my_test/deploy/assets/my_test/'; //путь к папке с моделью
        m_data.load(model_path + "my_cube.json", user_update); //загрузка модели с функцией обратного вызова 
        function user_update(data_id, success){ //функция обновления участников
            avatar_source = m_scenes.get_object_by_name("Cube",data_id); //выделение объекта по id
            m_scenes.hide_object(avatar_source);
            user_update1(data_id);          
        }
        function user_update1(data_id){
            var name = data.name;
            var pos = data.pos;
            var avatar_copy = m_objects.copy(avatar_source, name);
            avatar_copy.socket_id = socket_id;
            m_scenes.append_object(avatar_copy, 'Scene');
            m_scenes.show_object(avatar_copy);
            m_transform.set_translation(avatar_copy,pos[0],pos[1],pos[2]);
        } 
    });

    socket.on('connect', function () { //реакция на событие коннекта пользователя
    	var socket_id = '/#'+socket.id;
    	//console.log(socket_id);
        var model_path = '/my_test/deploy/assets/my_test/'; //путь к папке с моделью
        m_data.load(model_path + "my_cube.json", translation_avatar); //загрузка модели с функцией обратного вызова перемещения 

	    function translation_avatar(){ //функция перемещения объекта
	        var avatar = m_scenes.get_object_by_name("Cube",m_scenes.DATA_ID_ALL); //выделение объекта по id     
	        var name = "user" + Math.random(); //создание нового имени объекта
	        var avatar_copy = m_objects.copy(avatar, name);
	        avatar_copy.socket_id = socket_id;
	        //console.log(avatar_copy.socket_id);
	        m_scenes.append_object(avatar_copy, 'Scene');
	        var type = 'Mesh';
	        m_scenes.hide_object(avatar);
	        USER_NAME = name; //присвоение имени пользователя
	        var pos = [Math.random()*3,Math.random()*3,Math.random()*3]; //создание случайного вектора перемещения
	        m_transform.set_translation(avatar_copy,pos[0],pos[1],pos[2]); // присвоение позиции объекта случайному вектору
	        socket.emit('new_user',{type,name,pos});

	        m_app.enable_object_controls(avatar_copy);
			var sensor_motion_avatar = m_controls.create_motion_sensor(avatar_copy);
		    // array of the sensors
		    var impact_sens_array = [sensor_motion_avatar];
		    // manifold logic function
		    var impact_sens_logic = function(s) {
		        return (s[0])
		    };
		    // callback
		    var impact_cb = function(obj, manifold_id, pulse) {
		        var cord_avatar = m_transform.get_translation(avatar_copy);
		        //console.log(cord_cube);
		        socket.emit('move', {'cord':cord_avatar,'name':USER_NAME});
		    }
		    //создание sensor_manifold   
		    m_controls.create_sensor_manifold(avatar_copy, "IMPACT", m_controls.CT_CONTINUOUS, impact_sens_array, impact_sens_logic, impact_cb);	         
		    } 
    });

    socket.on('user_move', function(){
    	//console.log(arguments[0].data[0].name);
    	var user_name = arguments[0].data[0].name;
    	var new_user_pos = arguments[0].data[0].cord;
    	var avatar = m_scenes.get_object_by_name(user_name,m_scenes.DATA_ID_ALL);
     	m_transform.set_translation(avatar,new_user_pos[0],new_user_pos[1],new_user_pos[2]);
    });

    socket.on('add_new_user', function(data){
        var data = data;        
        var avatar_source;
        var socket_id = data.socket_id;
        var model_path = '/my_test/deploy/assets/my_test/'; //путь к папке с моделью
        m_data.load(model_path + "my_cube.json", user_update2); //загрузка модели с функцией обратного вызова 
        function user_update2(data_id, success){ //функция обновления участников
            avatar_source = m_scenes.get_object_by_name("Cube",data_id); //выделение объекта по id
            m_scenes.hide_object(avatar_source);
            user_update3(data_id);          
        }
        function user_update3(data_id){
            var name = data.data.name;
            var pos = data.data.pos;
            var avatar_copy = m_objects.copy(avatar_source, name);
            avatar_copy.socket_id = socket_id;
            m_scenes.append_object(avatar_copy, 'Scene');
            m_scenes.show_object(avatar_copy);
            m_transform.set_translation(avatar_copy,pos[0],pos[1],pos[2]);
        }        
    });

    socket.on('user_disconnect', function () { //реакция на событие дисконнекта пользователя
        var socket_id = arguments[0].socket_id ; //сокет ид пользователя, который отдисконнектился
        var scene_obj_list = m_scenes.get_all_objects(); //получение массива всех объектов сцены
        for(var i = 0; i<scene_obj_list.length; i++){ //перебор объектов сцены
        	if(scene_obj_list[i].socket_id){ //проверка наличия свойства сокет ид
        		//console.log('есть сокет ид');
        		//console.log(scene_obj_list[i]);
        		//console.log('сокет ид аватара' + scene_obj_list[i].socket_id);
        		//console.log('сокет ид пользователя, который отдисконнектился' + socket_id);
	        	if(scene_obj_list[i].socket_id == socket_id){ //проверка совпадения сокет ид аватара и пользователя, который отдисконнектился
	        		//console.log('удаление объекта');
	        		m_scenes.remove_object(scene_obj_list[i]); // удаление аватара пользователя
	        	}        		
        	}
        }
        //console.log(m_scenes.get_all_objects());
    });
}

});



// import the app module and start the app by calling the init method
b4w.require("my_test").init();
