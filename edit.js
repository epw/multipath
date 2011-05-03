var defining_new_path;
var remaining = 0;

var POSSIBLE_KEYS = ['A', 'S', 'D', 'F', 'Q', 'W', 'E', 'R', 'Z', 'X', 'C',
		    'V'];
var activationkey;

var editing;

function prepare_new_path (evt) {
    defining_new_path = true;
    canvas.style.cursor = "crosshair";
}

function 

function start_path (x, y) {
    path_followers.push (new Follower (activationkey, null, x, y, [[x, y]]));
    editing = path_followers[path_followers.length - 1];
    defining_new_path = false;
    canvas.style.cursor = "auto";
}

function mouse_down (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    if (defining_new_path) {
	start_path (mouse_x, mouse_y);
    } else if (editing != null) {
	editing.path.push ([mouse_x, mouse_y]);
	if (keys[KEY.SHIFT]) {
	    editing = null;
	}
    }
}

function mouse_motion (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    if (editing != null) {
	editing.path[editing.path.length-1][0] = mouse_x;
	editing.path[editing.path.length-1][1] = mouse_y;
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

    start_main_loop ();
}

$(document).ready (init);
$(document).mousedown (mouse_down);
$(document).mousemove (mouse_motion);
$(document).keydown (key_press);
$(document).keyup (key_release);
