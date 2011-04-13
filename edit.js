var defining_new_start;
var remaining = 0;

function mouse_down (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    if (defining_new_start) {
	path_followers.push (new Follower ('A', null, mouse_x, mouse_y, []));
	defining_new_start = false;
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
    switch (event.which) {
    case KEY.ESCAPE:
	clearInterval (main_loop);
	break;
    case ord('N'):
	defining_new_start = true;
	break;	
    }
}

function init () {
    canvas = document.getElementById("canvas");

    goal = load_image ("goal.png");

    current_level = "Editor";

    defining_new_start = false;

    start_main_loop ();
}

$(document).ready (init);
$(document).mousedown (mouse_down);
$(document).keydown (key_press);
$(document).keyup (key_release);
