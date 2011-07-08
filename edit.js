var defining_new_path;
var remaining = 0;

var POSSIBLE_KEYS = ['A', 'S', 'D', 'F', 'Q', 'W', 'E', 'R', 'Z', 'X', 'C',
		    'V'];
var activationkey;

var editing;

var deleting = false;

var angle_lock = true;
var ANGLE_STEPS = 16;
function limit_line_angle (start_x, start_y, cur_x, cur_y) {
    var theta = -Math.atan2 (cur_y - start_y, cur_x - start_x) + Math.PI / 2;
//    console.log (theta);
    var dist = hypot (cur_y - start_y, cur_x - start_x);

    var radian_step = Math.PI * 2 / ANGLE_STEPS;

    if (theta < 0) {
	theta += Math.PI * 2;
    }

    var i;
    
    for (i = 0; i * radian_step < theta; i++) {
    }

    if (Math.abs (theta - (i - 1) * radian_step)
	< Math.abs (theta - i * radian_step)) {
	i--;
    }
    
    var x = dist * Math.sin (radian_step * i);
    var y = dist * Math.cos (radian_step * i);

    return [start_x + x, start_y + y];
}

function prepare_new_path (evt) {
    defining_new_path = true;
    canvas.style.cursor = "crosshair";

    $("#newpath").attr ('disabled', 'disabled');
    $("#endpath").attr ('disabled', '');
}
function end_path (evt) {
/* Code for finish path as button. Does not seem to work.
    if (typeof (evt) != "undefined") {
	if (typeof (evt.currentTarget) != "undefined") {
	}
    }
*/
    editing = null;
    $("#newpath").attr ('disabled', '');
    $("#endpath").attr ('disabled', 'disabled');
}

function delete_choose (evt) {
    if (deleting) {
	deleting = false;
	$("#deletepath").css ("border-style", "");
    } else {
	deleting = true;
	$("#deletepath").css ("border-style", "inset");
    }
}

function start_path (x, y) {
    path_followers.push (new Follower (activationkey, null, x, y, [[x, y]]));
    editing = path_followers[path_followers.length - 1];
    defining_new_path = false;
    canvas.style.cursor = "auto";
}

function remove_last_vertex () {
    if (editing.path.length > 1) {
	editing.path.pop ();
    }
}

function mouse_down (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    var pos = [mouse_x, mouse_y];

    if (event.which == 3) {
	return;
    }

    if (defining_new_path) {
	start_path (mouse_x, mouse_y);
    } else if (editing != null) {
	if (angle_lock) {
	    if (editing.path.length < 2) {
		pos = limit_line_angle (editing.start[0], editing.start[1],
					pos[0], pos[1]);
	    } else {
		pos = limit_line_angle (editing.path[editing.path.length-2][0],
					editing.path[editing.path.length-2][1],
					pos[0], pos[1]);
	    }
	}
	editing.path.push (pos);
	if (event.which == 2) {
	    end_path ();
	    return;
	}
    } else if (deleting) {
	for (f in path_followers) {
	    if (path_followers[f].point_in (pos)) {
		path_followers.splice (f, 1);
		break;
	    }
	}
    }
}

function mouse_motion (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    var pos = [mouse_x, mouse_y];

    if (editing != null) {
	if (angle_lock) {
	    if (editing.path.length < 2) {
		pos = limit_line_angle (editing.start[0], editing.start[1],
					pos[0], pos[1]);
	    } else {
		pos = limit_line_angle (editing.path[editing.path.length-2][0],
					editing.path[editing.path.length-2][1],
					pos[0], pos[1]);
	    }
	} else {
	    pos = [mouse_x, mouse_y];
	}
	editing.path[editing.path.length-1][0] = pos[0];
	editing.path[editing.path.length-1][1] = pos[1];
    } else if (deleting) {
	for (f in path_followers) {
	    if (path_followers[f].point_in (pos)) {
		path_followers[f].current_frame = "collision";
	    } else {
		path_followers[f].current_frame = 0;		
	    }
	}
    }
}

function key_press (event) {
    keys[event.which] = true;
    keys[chr(event.which)] = true;
    switch (event.which) {
    case KEY.SHIFT:
	angle_lock = false;
	break;
    default:
	break;
    }
}
function key_release (event) {
    keys[event.which] = false;
    keys[chr(event.which)] = false;
    if (POSSIBLE_KEYS.indexOf (chr(event.which)) != -1) {
	activationkey = chr(event.which);
	$("#activationkey").html (chr(event.which));
    }
    switch (event.which) {
    case KEY.ESCAPE:
	clearInterval (main_loop);
	break;
    case ord('N'):
	prepare_new_path ();
	break;	
    case KEY.MINUS:
	remove_last_vertex ();
	break;	
    case KEY.PERIOD:
	end_path ();
	break;	
    case KEY.SPACE:
	activationkey = null;
	$("#activationkey").html ("");
	break;
    case KEY.SHIFT:
	angle_lock = true;
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    goal = load_image ("goal.png");

    activationkey = null;

    current_level = "Editor";

    defining_new_path = false;
    editing = null;

    $("#newpath").click (prepare_new_path);
    $("#endpath").click (end_path);
    $("#deletepath").click (delete_choose);

    start_main_loop ();
}

$(document).ready (init);
$(document).mousedown (mouse_down);
$(document).mousemove (mouse_motion);
$(document).keydown (key_press);
$(document).keyup (key_release);
