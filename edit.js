var defining_new_path;
var remaining = 0;

var POSSIBLE_KEYS = ['A', 'S', 'D', 'F', 'Q', 'W', 'E', 'R', 'Z', 'X', 'C',
		    'V'];
var activationkey;

var editing;

var grid = false;
var grid_size = 25;

var making_loops = false;

var deleting = false;

function save () {
    var saved_level = {"paths": []};
    if ($("#author").val() != "") {
	saved_level.author = $("#author").val();
    }
    for (f in path_followers) {
	saved_level.paths.push ({'start': path_followers[f].start,
				 'activate_key': path_followers[f].activate_key,
				 'loop': path_followers[f].loop,
				 'path': path_followers[f].path});
    }
    $("#data").val (JSON.stringify (saved_level));
}

function press_button (id) {
    $(id).css ("border-style", "inset");
}
function release_button (id) {
    $(id).css ("border-style", "");
}

function snap_to_grid (pos) {
    var x = pos[0];
    var y = pos[1];

    if (grid && !keys[KEY.SHIFT]) {
	var floor;

	floor = Math.floor (x / grid_size) * grid_size;
	if (x - floor < grid_size / 2) {
	    x = floor;
	} else {
	    x = floor + grid_size;
	}

	floor = Math.floor (y / grid_size) * grid_size;
	if (y - floor < grid_size / 2) {
	    y = floor;
	} else {
	    y = floor + grid_size;
	}
    }
    return [x, y];
}

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

    return [Math.round (start_x + x), Math.round (start_y + y)];
}

function prepare_new_path (evt) {
    if (deleting) {
	delete_choose (null);
    }

    defining_new_path = true;
    canvas.style.cursor = "crosshair";

}
function end_path (evt) {
/* Code for finish path as button. Does not seem to work.
    if (typeof (evt) != "undefined") {
	if (typeof (evt.currentTarget) != "undefined") {
	}
    }
*/
    editing = null;
    activationkey = null;

    save ();
}

function delete_choose (evt) {
    if (deleting) {
	deleting = false;
	release_button ("#deletepath");
    } else {
	deleting = true;
	press_button ("#deletepath");
    }
}

function start_path (x, y) {
    path_followers.push (new Follower (activationkey, null, x, y, [[x, y]]));
    editing = path_followers[path_followers.length - 1];
    defining_new_path = false;
    canvas.style.cursor = "auto";
}

function toggle_grid (evt) {
    if (grid) {
	grid = false;
	release_button ("#grid");
    } else {
	grid = true;
	press_button ("#grid");
    }
}

function make_loops (evt) {
    if (making_loops) {
	making_loops = false;
	release_button ("#makeloops");
	for (f in path_followers) {
	    if (path_followers[f].loop) {
		path_followers[f].current_frame = 0;
	    }
	}
    } else {
	making_loops = true;
	press_button ("#makeloops");

	for (f in path_followers) {
	    if (path_followers[f].loop) {
		path_followers[f].current_frame = "finished";
	    }
	}
    }
}

function remove_last_vertex (evt) {
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

    if (!between (pos[0], 0, canvas.width)
	|| !between (pos[1], 0, canvas.height)) {
	return;
    }

    if (defining_new_path) {
	pos = snap_to_grid (pos);
	start_path (pos[0], pos[1]);
    } else if (editing != null) {
	if (event.which == 2) {
	    end_path ();
	    return;
	}
	if (!grid && angle_lock) {
	    if (editing.path.length < 2) {
		pos = limit_line_angle (editing.start[0], editing.start[1],
					pos[0], pos[1]);
	    } else {
		pos = limit_line_angle (editing.path[editing.path.length-2][0],
					editing.path[editing.path.length-2][1],
					pos[0], pos[1]);
	    }
	}
	pos = snap_to_grid (pos);
	editing.path.push (pos);
    } else if (making_loops) {
	for (f in path_followers) {
	    if (path_followers[f].point_in (pos)) {
		if (path_followers[f].loop) {
		    path_followers[f].loop = false;
		    path_followers[f].current_frame = 0;
		} else {
		    path_followers[f].loop = true;
		    path_followers[f].current_frame = "finished";
		}
	    }
	}
	save ();
    } else if (deleting) {
	var deleted_one = false;
	for (f in path_followers) {
	    if (path_followers[f].point_in (pos)) {
		path_followers.splice (f, 1);
		deleted_one = true;
		break;
	    }
	}
	if (deleted_one) {
	    delete_choose ();
	    save ();
	}
    }
}

function mouse_motion (event) {
    var mouse_x = event.offsetX - 5;
    var mouse_y = event.offsetY - 5;

    var pos = [mouse_x, mouse_y];

    if (!between (pos[0], 0, canvas.width)
	|| !between (pos[1], 0, canvas.height)) {
	return;
    }

    if (editing != null) {
	if (!grid && angle_lock) {
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
	pos = snap_to_grid (pos);
	editing.path[editing.path.length-1][0] = pos[0];
	editing.path[editing.path.length-1][1] = pos[1];
    } else if (making_loops) {
	var over_sphere = false;
	for (f in path_followers) {
	    if (path_followers[f].point_in (pos)) {
		over_sphere = true;
	    }
	}
	if (over_sphere) {
	    canvas.style.cursor = "pointer";
	} else {
	    canvas.style.cursor = "auto";
	}
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

function draw_grid (ctx) {
    if (grid) {
	ctx.save ();
	ctx.strokeStyle = "rgb(50, 50, 50)";
	ctx.lineWidth = 1;
	for (var x = 0; x < canvas.width; x += grid_size) {
	    ctx.beginPath ();
	    ctx.moveTo (x, 0);
	    ctx.lineTo (x, canvas.height);
	    ctx.stroke ();
	}
	for (var y = 0; y < canvas.height; y += grid_size) {
	    ctx.beginPath ();
	    ctx.moveTo (0, y);
	    ctx.lineTo (canvas.width, y);
	    ctx.stroke ();
	}
    }
}

function clear (evt) {
    $("#data").val ("");
    path_followers = [];
}

function load (evt) {
    level_data = load_level ($("#newdata").val());
    path_followers = level_data.paths;
    if (typeof(level_data["author"]) != "undefined") {
	$("#author").val (level_data.author);
    }
    save ();
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
	if (!keys[KEY.CONTROL]) {
	    activationkey = chr(event.which);
	    prepare_new_path ();
	}
    }
    switch (event.which) {
    case ord('N'):
	if (defining_new_path == false && editing == null) {
	    prepare_new_path ();
	} else {
	    defining_new_path = false;
	    canvas.style.cursor = "auto";
	    activationkey = null;
	}
	break;	
    case ord('G'):
	toggle_grid ();
	break;
    case KEY.DELETE:
	delete_choose ();
	break;
    case KEY.MINUS:
	remove_last_vertex ();
	break;	
    case KEY.PERIOD:
	end_path ();
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
    $("#grid").click (toggle_grid);
    $("#makeloops").click (make_loops);
    $("#deletepath").click (delete_choose);
    $("#clear").click (function () {
			   if (confirm ("Really clear level?")) {
			       clear ();
			   }
		       });
    $("#load").click (function () {
			  if (confirm ("Really load level (clearing the current one)?")) {
			      load ();
			  }
		      });

    $("#author").change (save);

    $("#back").click (function () {
			  if (confirm ("Really to back (clearing current level)?")) {
			      return true;
			  }
			  return false;
		      });

    background_hooks.push (draw_grid);

    start_main_loop ();
}

$(document).ready (init);
$(document).mousedown (mouse_down);
$(document).mousemove (mouse_motion);
$(document).keydown (key_press);
$(document).keyup (key_release);
