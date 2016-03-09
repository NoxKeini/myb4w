"use strict"
// register the application module
b4w.register("my_function", function(exports, require) {
var m_scenes = require("scenes");
var m_data = require("data");
var	m_transform = require("transform");
var m_objects = require('objects');
var m_tex = require("textures");
var m_app  = require("app");		
var m_controls = require("controls");
var m_constraints = require("constraints");
var m_vec3 = require("vec3");
var m_quat = require("quat");
var m_camera = require("camera");
var m_physics = require('physics');
var m_my_socket = require('my_socket');
//var m_my_obj_controls = require('my_obj_controls');
var m_my_character_controls = require('my_character_controls');
var MODEL_PATH = '/my_test/deploy/assets/my_test/';
//var DIST_MIN = 6;
//var DIST_MAX = DIST_MIN*1.3;
var v3_camera = m_vec3.fromValues(0, 1.3, 0.35);
var camera = m_scenes.get_object_by_name("Camera", m_scenes.DATA_ID_ALL);
//var q4_camera// = m_quat.fromValues(0, 90, 0, 0);
//var q4_camera = m_quat.create();

var add_sensors = function(obj){
    m_app.enable_object_controls(obj);
    var sensor_motion = m_controls.create_motion_sensor(obj);
    var impact_sens_array = [sensor_motion];
    var impact_sens_logic = function(s) {
        return (s[0])
    };
    var impact_cb = function(obj, manifold_id, pulse){
    	var socket_id = SOCKET_ID;
        var cord = m_transform.get_translation(obj);
        var quat = m_transform.get_rotation(obj, m_quat.create());
        m_my_socket.move(socket_id, cord, quat);
        //console.log(cord);
        //var plane = m_scenes.get_object_by_name("Cube", m_scenes.DATA_ID_ALL);
        //console.log(m_physics.has_physics(plane));
    }
    m_controls.create_sensor_manifold(obj, "CHARACTER", m_controls.CT_CONTINUOUS, impact_sens_array, impact_sens_logic, impact_cb);            
};

var add_sensor_camera = function(obj){
    var sensor_motion = m_controls.create_motion_sensor(obj);
    var impact_sens_array = [sensor_motion];
    var impact_sens_logic = function(s) {
        return (s[0])
    };
    var impact_cb = function(obj, manifold_id, pulse){
        var q_cam = m_transform.get_rotation(obj, m_quat.create());
        var q_cam_y = [0,q_cam[1],0,q_cam[3]];
        var q_rot = m_quat.setAxisAngle([0, 1, 0], Math.PI, m_quat.create());
        var q_mult = m_quat.multiply(q_rot, q_cam_y, m_quat.create());
        var obj = my_get_obj_by_socket_id(SOCKET_ID);
		//m_transform.set_rotation_v(obj, q_mult);
    }
    m_controls.create_sensor_manifold(obj, "CAMERA", m_controls.CT_CONTINUOUS, impact_sens_array, impact_sens_logic, impact_cb); 	
}
add_sensor_camera(m_scenes.get_active_camera());     

exports.create_obj = function(name, model_name, pos, socket_id, quat){
    var model_dubl = check_availability_model(model_name);
    var quat = quat || m_quat.create();
    if (model_dubl != false){
        copy_obj(model_dubl, name, socket_id, pos, model_name, quat);
    }else{
        m_data.load(MODEL_PATH + model_name + ".json", loaded_cb);//загрузка модели с функцией обратного вызова;
        function loaded_cb(data_id, success){
            load_obj(data_id, success, name, socket_id, pos, model_name, quat);
        };
    };            
}; 

var check_availability_model = function(model_name){
    var obj_list = m_scenes.get_all_objects();
    for (var i = 0; i < obj_list.length; i++){
        if (obj_list[i].model_name == model_name){
            return obj_list[i];
        }
    }  
    return false;          
};

exports.create_character = function(name, model_name, pos, socket_id){
	console.log('Создание персонажа');
    m_data.load(MODEL_PATH + model_name + ".json", loaded_cb);//загрузка модели с функцией обратного вызова;
    function loaded_cb(data_id, success){
        //load_obj(data_id, success, name, socket_id, pos, model_name, quat);
        var char = m_scenes.get_object_by_name("my_drone",data_id);//выделение объекта по id 
        //var char = m_scenes.get_object_by_name("character_box",data_id);//выделение объекта по id
		char.model_name = model_name;
    	char.socket_id = socket_id;
    	char.name = name;
    	char.origin_name = name;  
    	add_field_nickname(char);  
		add_sensors(char); 
		m_my_character_controls.enable_object_controls(char);
        m_constraints.append_stiff_trans(camera, char, v3_camera);        	
    };  
}

var load_obj = function(data_id, success, name, socket_id, pos, model_name, quat){ //добавление объекта
	console.log('Загрузка объекта');
    //var obj = m_scenes.get_object_by_name("Cube",data_id); //выделение объекта по id
    var obj = m_scenes.get_object_by_name("my_drone",data_id); //выделение объекта по id
    //var obj = m_scenes.get_object_by_name("character_box",data_id); //выделение объекта по id
	console.log(m_physics.has_dynamic_physics(obj));
    m_scenes.hide_object(obj);
   	copy_obj(obj , name, socket_id, pos, model_name, quat);            
};

var copy_obj = function(obj, name, socket_id, pos, model_name, quat){ //копирование объекта
    console.log('Копирование объекта');
    var obj = m_objects.copy(obj, name);   
    obj.model_name = model_name;
    obj.socket_id = socket_id;
    m_scenes.append_object(obj, 'Scene');
    m_transform.set_translation(obj,pos[0],pos[1],pos[2]);
    m_transform.set_rotation_v(obj, quat);             
    m_scenes.show_object(obj);
    add_field_nickname(obj);
    //console.log(obj);
    if (socket_id == SOCKET_ID){
        add_sensors(obj); 
        //m_my_obj_controls.enable_object_controls(obj);

        m_constraints.append_stiff_trans(camera, obj, v3_camera);
        //m_physics.set_character_move_type(obj, m_physics.CM_WALK);
        //m_physics.enable_simulation(obj);
        console.log(m_physics.has_dynamic_physics(obj));
        //m_physics.set_gravity(obj, 1);
    };            
}; 

var add_field_nickname = function(obj){
    var model_name = "field_nickname";
    var text = ["Аноним"];
    var MARGIN_LEFT = 25;
    var LINE_SPACING = 25; 
    var MARGIN_TOP = 75;
    var v3_local = m_vec3.fromValues(0, 1.6, 0);
    
    m_data.load(MODEL_PATH + model_name +".json", load_cb);

    function load_cb(){
        var Field_nickname = m_scenes.get_object_by_name("field_nickname", m_scenes.DATA_ID_ALL);
        var field_nickname = m_objects.copy(Field_nickname, obj.name + '_field_nickname');
        m_scenes.hide_object(Field_nickname);
        field_nickname.model_name = model_name;
        m_scenes.append_object(field_nickname, 'Scene');
        m_scenes.show_object(field_nickname);
        m_constraints.append_copy_trans(field_nickname, obj, v3_local);
        var ctx_image = m_tex.get_canvas_ctx(field_nickname, "texture_field_nickname");
        var font = ctx_image.font.split("px");
        var font_height = parseInt(font[0]);
        ctx_image.fillStyle = "rgba(255,230,150,255)"; //Определяет цвет заливки.
        ctx_image.font = "100px Arial";
        for (var i = 0; i < text.length; i++)
            ctx_image.fillText(text[i], MARGIN_LEFT, Math.round(LINE_SPACING * font_height * i + MARGIN_TOP));
        m_tex.update_canvas_ctx(field_nickname, "texture_field_nickname");
    };
};     

var my_get_obj_by_socket_id = function(socket_id){  //в идеале заменить на РАБОЧУЮ ф-цию из API b4w
    var obj_list = m_scenes.get_all_objects();
    for(var i = 0; i < obj_list.length; i++){
        if (obj_list[i].socket_id == socket_id){
            return obj_list[i];
        };
    };
};

exports.remove_obj_by_socket_id = function(socket_id){
    var scene_obj_list = m_scenes.get_all_objects(); //получение массива всех объектов сцены
    var name_field_nickname;
    var field_nickname;
    for(var i = 0; i<scene_obj_list.length; i++){ //перебор объектов сцены
        if(scene_obj_list[i].socket_id){ //проверка наличия свойства сокет ид
            if(scene_obj_list[i].socket_id == socket_id){ //проверка совпадения сокет ид аватара и пользователя, который отдисконнектился
            	name_field_nickname = scene_obj_list[i].name + '_field_nickname';
                m_scenes.remove_object(scene_obj_list[i]); // удаление аватара пользователя
                field_nickname = m_scenes.get_object_by_name(name_field_nickname, m_scenes.DATA_ID_ALL);
                m_scenes.remove_object(field_nickname);
            };               
        }
    }            
}                                
});