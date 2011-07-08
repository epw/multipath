var defining_new_path;
var remaining = 0;

var POSSIBLE_KEYS = ['A', 'S', 'D', 'F', 'Q', 'W', 'E', 'R', 'Z', 'X', 'C',
		    'V'];
var activationkey;

var editing;

var ANGLE_STEPS = 8;
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

function start_path (x, y) {
    path_followers.push (new Follower (activationkey, null, x, y, [[x, y]]));
    editing = path_followers[path_followers.length - 1];
    defining_new_path = false;
    canvas.style.cursor = "auto";
}

function mouse_down (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    if (event.which == 3) {
	return;
    }

    if (defining_new_path) {
	start_path (mouse_x, mouse_y);
    } else if (editing != null) {
	if (editing.path.length < 2) {
	    pos = limit_line_angle (editing.start[0], editing.start[1],
				    mouse_x, mouse_y);
	} else {
	    pos = limit_line_angle (editing.path[editing.path.length-2][0],
				    editing.path[editing.path.length-2][1],
				    mouse_x, mouse_y);
	}
	editing.path.push (pos);
	if (event.which == 2) {
	    end_path ();
	    return;
	}
    }
}

function mouse_motion (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    if (editing != null) {
	if (editing.path.length < 2) {
	    pos = limit_line_angle (editing.start[0], editing.start[1],
				    mouse_x, mouse_y);
	} else {
	    pos = limit_line_angle (editing.path[editing.path.length-2][0],
				    editing.path[editing.path.length-2][1],
				    mouse_x, mouse_y);
	}
	editing.path[editing.path.length-1][0] = pos[0];
	editing.path[editing.path.length-1][1] = pos[1];
    }
}

function key_press (event) {
    keys[event.which] = true;
    keys[chr(event.which)] = true;
    switch (event.which) {
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
    case KEY.PERIOD:
	end_path ();
	break;	
    case KEY.SPACE:
	activationkey = null;
	$("#activationkey").html ("");
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

    start_main_loop ();
}

$(document).ready (init);
$(document).mousedown (mouse_down);
$(document).mousemove (mouse_motion);
$(document).keydown (key_press);
$(document).keyup (key_release);
