"use strict"
// register the application module
b4w.register("my_character_controls", function(exports, require) {
exports.enable_object_controls = function(obj) {

	var m_ctl = require("controls");
	var m_phy = require('physics');

    var key_w     = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_s     = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_up    = m_ctl.create_keyboard_sensor(m_ctl.KEY_UP);
    var key_down  = m_ctl.create_keyboard_sensor(m_ctl.KEY_DOWN);
    var key_a     = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_d     = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);
    var key_left  = m_ctl.create_keyboard_sensor(m_ctl.KEY_LEFT);
    var key_right = m_ctl.create_keyboard_sensor(m_ctl.KEY_RIGHT);


    var move_array = [
        key_w, key_up,
        key_s, key_down,
        key_a, key_left,
        key_d, key_right
    ];

    var forward_logic  = function(s){return (s[0] || s[1])};
    var backward_logic = function(s){return (s[2] || s[3])};
    var left_logic  = function(s){return (s[4] || s[5])};
    var right_logic = function(s){return (s[6] || s[7])};    

    function move_cb(obj, id, pulse) {
        if (pulse == 1) {
            switch(id) {
            case "FORWARD":
                var move_dir = 1;
                //m_anim.apply(_character_rig, "character_run");
                break;
            case "BACKWARD":
                var move_dir = -1;
                //m_anim.apply(_character_rig, "character_run");
                break;
            case "LEFT":
                var move_dir1 = 1;
                //m_anim.apply(_character_rig, "character_run");
                break;
            case "RIGHT":
                var move_dir1 = -1;
                //m_anim.apply(_character_rig, "character_run");
                break;  
            }    
        } else {
            var move_dir = 0;
            var move_dir1 = 0;
            //m_anim.apply(_character_rig, "character_idle_01");
        }

        m_phy.set_character_move_dir(obj, move_dir, move_dir1);

        //m_anim.play(_character_rig);
        //m_anim.set_behavior(_character_rig, m_anim.AB_CYCLIC);
    };

    m_ctl.create_sensor_manifold(obj, "FORWARD", m_ctl.CT_TRIGGER,
        move_array, forward_logic, move_cb);
    m_ctl.create_sensor_manifold(obj, "BACKWARD", m_ctl.CT_TRIGGER,
        move_array, backward_logic, move_cb);
    m_ctl.create_sensor_manifold(obj, "LEFT", m_ctl.CT_TRIGGER,
        move_array, left_logic, move_cb);
    m_ctl.create_sensor_manifold(obj, "RIGHT", m_ctl.CT_TRIGGER,
        move_array, right_logic, move_cb);   
}
});