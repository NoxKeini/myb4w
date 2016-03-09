"use strict"

// register the application module
b4w.register("my_interface", function(exports, require) {
    exports.init = function() {
    	// import modules used by the app
		var m_scenes = b4w.require("scenes");
		var m_controls = b4w.require("controls");
		var m_tex = b4w.require("textures");

	   	// параметры печати текста
	    var text = ["Войти"];
	    var MARGIN_LEFT = 100;
	    var LINE_SPACING = 50; 
	    var MARGIN_TOP = 200;

	    // поиск объекта-носителя канвы
	    var obj = m_scenes.get_object_by_name("Interface");

	    // поиск текстуры по имени
	    var ctx_image = m_tex.get_canvas_ctx(obj, "Texture_interface");
	    var font = ctx_image.font.split("px");
	    var font_height = parseInt(font[0]);

	    //HTML5 Canvas функции и переменные
	    ctx_image.fillStyle = "rgba(255,230,150,255)"; //Определяет цвет заливки.
	    //ctx_image.clearRect(0,0,512,512);//очищает указанную область    
	    ctx_image.font = "200px Arial";
	    //ctx_image.textAlign = "start";//горизонтальное выравнивание текста

	    //вывод текста
	    for (var i = 0; i < text.length; i++)
	        ctx_image.fillText(text[i], MARGIN_LEFT, Math.round(LINE_SPACING * font_height * i + MARGIN_TOP));

	    // обновление канвы
	    m_tex.update_canvas_ctx(obj, "Texture_interface");

	    //блок сенсора выделения кнопки войти;
	    var btn_enter = m_scenes.get_object_by_name('Interface');
	    //m_app.enable_object_controls(btn_enter);
	    var sensor_select_btn_enter = m_controls.create_selection_sensor(btn_enter);
	    var impact_sens_array = [sensor_select_btn_enter];
	    var impact_sens_logic = function(s) {
	        console.log(s);
	        return (s[0]);
	    };
	    var k = 0;
	    var impact_cb = function(obj, manifold_id, pulse) {
	        k++;
	        if (k>1){
	            var div = document.createElement('div');
	            div.setAttribute("id", "Div_login");
	            //div.innerHTML = '<form action="/static" method = "POST"><input type="text" name="login" value="NickName"><input type="password" name="password" value="secret"><input type="submit" name="submit" value="login"></form>';
	            div.innerHTML = '<form name="login"><input type="text" name="name" value="NickName"><input type="password" name="password" value="Secret"><input type="button" name="submit" value="GO" onclick="my_login()"></form>';
	            div.style.position = 'absolute';
	            document.body.appendChild(div);
	            m_controls.remove_sensor_manifold(obj);
 				m_scenes.hide_object(obj);
	        }
	    }
	    m_controls.create_sensor_manifold(btn_enter, "IMPACT", m_controls.CT_CHANGE, impact_sens_array, impact_sens_logic, impact_cb);
    }
});