"use strict"
// register the application module
b4w.register("my_obj_controls", function(exports, require) {
exports.enable_object_controls = function(obj) {
    var m_phy = require('physics');
    var m_ctl = require('controls');
    var m_trans = require('transform');
    //var m_scenes = require('scenes');
    var trans_speed = 10;
    var is_vehicle = m_phy.is_vehicle_chassis(obj) ||
            m_phy.is_vehicle_hull(obj);
    var key_cb = function(obj, id, pulse) {
        if (pulse == 1) {
            var elapsed = m_ctl.get_sensor_value(obj, id, 0);
            switch (id) {
            case "FORWARD":
                if (is_vehicle){
                    m_phy.vehicle_throttle(obj, 1);
                    console.log('вперёд физика !!ахаха');                    
                }
                else{
                    //m_trans.move_local(obj, 0, 0, trans_speed * elapsed);
                    //console.log('вперёд');
                    //m_trans.set_translation(obj, 0, 0, trans_speed * elapsed)
                    //m_phy.vehicle_throttle(obj, 1);
                    m_phy.set_character_move_dir(obj, 1, 0);
                    console.log('вперёд физика !!ахаха');                                          
                }
                break;
            case "BACKWARD":
                if (is_vehicle)
                    m_phy.vehicle_throttle(obj, -1);
                else
                    m_trans.move_local(obj, 0, 0, -trans_speed * elapsed);
                    //m_trans.set_translation(obj, 0, 0, -trans_speed * elapsed);
                break;
            case "ROTATE-LEFT":
                if (is_vehicle)
                    m_phy.vehicle_steer(obj, -1);
                else{
                    //m_trans.rotate_y_local(obj, trans_speed * elapsed);
                    m_trans.move_local(obj, trans_speed * elapsed, 0, 0);
                    //m_trans.rotate_y_local(m_scenes.get_active_camera(), trans_speed * elapsed);
                }
                break;
            case "ROTATE-RIGHT":
                if (is_vehicle)
                    m_phy.vehicle_steer(obj, 1);
                else{
                    //m_trans.rotate_y_local(obj, -trans_speed * elapsed);
                    m_trans.move_local(obj, -trans_speed * elapsed, 0, 0);
                    //m_trans.rotate_y_local(m_scenes.get_active_camera(), -trans_speed * elapsed);     
                }               
                break;
            default:
                break;
            }
        } else {
            switch (id) {
            case "FORWARD":
            case "BACKWARD":
                if (is_vehicle)
                    m_phy.vehicle_throttle(obj, 0);
                break;
            case "ROTATE-LEFT":
            case "ROTATE-RIGHT":
                if (is_vehicle)
                    m_phy.vehicle_steer(obj, 0);
                break;
            default:
                break;
            }
        }
    }
    var elapsed = m_ctl.create_elapsed_sensor();
    var key_w = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_s = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_a = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_d = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);
    var key_up = m_ctl.create_keyboard_sensor(m_ctl.KEY_UP);
    var key_down = m_ctl.create_keyboard_sensor(m_ctl.KEY_DOWN);
    var key_left = m_ctl.create_keyboard_sensor(m_ctl.KEY_LEFT);
    var key_right = m_ctl.create_keyboard_sensor(m_ctl.KEY_RIGHT);
    var key_logic = function(s) {
        return s[0] && (s[1] || s[2]);
    }
    m_ctl.create_sensor_manifold(obj, "FORWARD", m_ctl.CT_CONTINUOUS,
            [elapsed, key_w, key_up], key_logic, key_cb);
    m_ctl.create_sensor_manifold(obj, "BACKWARD", m_ctl.CT_CONTINUOUS,
            [elapsed, key_s, key_down], key_logic, key_cb);
    m_ctl.create_sensor_manifold(obj, "ROTATE-LEFT", m_ctl.CT_CONTINUOUS,
            [elapsed, key_a, key_left], key_logic, key_cb);
    m_ctl.create_sensor_manifold(obj, "ROTATE-RIGHT", m_ctl.CT_CONTINUOUS,
            [elapsed, key_d, key_right], key_logic, key_cb);
}
});