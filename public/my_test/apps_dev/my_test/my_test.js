"use strict"

// register the application module
b4w.register("my_test", function(exports, require) {


// import modules used by the app
var m_app  = require("app");
var m_cfg  = require("config");
var m_data = require("data");
var m_ver  = require("version");
var m_cont  = require("container");
var m_mouse = require("mouse");
var _character;

// import my_modules used by the app
var m_my_socket = b4w.require("my_socket");
var m_my_interface = b4w.require("my_interface");

// detect application mode
//var DEBUG = (m_ver.type() === "DEBUG");
var DEBUG = (m_ver.type() === "RELEASE");
// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "my_test/"; //в дальнейшем путь был исправлен мной в связи с перемещением основного файла приложения в папку public

//my_var
var USER_NAME;
/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        physics_enabled: true,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true,
        //physics_uranium_path: "../deploy/apps/common/uranium.js"

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
    window.addEventListener("resize", on_resize);
    load();
}

function on_resize() {
    m_app.resize_to_container();
};

/**
 * load the scene data
 */
function load() {
    APP_ASSETS_PATH = '/my_test/deploy/assets/my_test/'
    m_data.load(APP_ASSETS_PATH + "my_test.json", load_cb);
    m_data.load(APP_ASSETS_PATH + "terrain.json");   
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }
    m_my_socket.init();//инициализация моего модуля сокетов
    m_my_interface.init();//инициализация моего модуля интерфейса 

    // enable rotation with mouse
    var canvas_elem = m_cont.get_canvas();
    canvas_elem.addEventListener("mouseup", function(e) {
        m_mouse.request_pointerlock(canvas_elem);
    }, false);  

    //_character = m_scs.get_first_character();           
}

});

// import the app module and start the app by calling the init method
b4w.require("my_test").init();

