var collision = false;
var paused = false;
var stop = false;

var remaining = 0;

function win () {
    current_level = "-";
    game_messages.push (new Game_Msg("All levels completed!\n" +
				     "You win!",
				     "rgb(0, 175, 0)"));
    stop = true;
}

function parse_level (data) {
    if (data.search ("// JavaScript") == 0) {
	eval (data);
    } else {
	path_followers = load_level (data);
    }

    for (f in path_followers) {
	if (path_followers[f].activate_key) {
	    remaining++;
	}
    }
}

function lookup_load_level () {
    path_followers = [];
    game_messages = [];
    remaining = 0;

    $.post (level_directory + "/" + current_level + '.lvl', parse_level)
	.error (win);

}

function selected_level (evt) {
    level_directory = $("#levelset").val();
    current_level = 1;
    lookup_load_level ();
}

Follower.prototype.update =
    function () {
	if (this.finished) {
	    return;
	}

	if (this.stopped == false && (keys[this.activate_key]
				      || this.activate_key == null)) {
 	    var angle = Math.atan2 (this.path[this.pathid][1] - this.y,
 				    this.path[this.pathid][0] - this.x);
 	    this.vx = this.speed * Math.cos(angle);
 	    this.vy = this.speed * Math.sin(angle);
	} else {
	    this.vx = 0;	    
	    this.vy = 0;
	}
	
	Game_Object.prototype.update.call (this);

	var dist = hypot (this.path[this.pathid][1] - this.y,
 			  this.path[this.pathid][0] - this.x);
	if (dist < this.speed) {
	    this.x = this.path[this.pathid][0];
	    this.y = this.path[this.pathid][1];
	    this.pathid++;
	}

	for (f in path_followers) {
	    if (path_followers[f] == this || this.activate_key == null) {
		continue;
	    }
	    if (this.touching (path_followers[f])) {
		collision = true;
		game_messages.push (new Game_Msg ("Collision!\n(Press Space to restart)", "red"));
		this.current_frame = "collision";
		this.stopped = true;
		path_followers[f].current_frame = "collision";
		path_followers[f].stopped = true;
	    }
	}

	if (this.pathid == this.path.length) {
	    if (this.loop) {
		this.pathid = 0;
		this.x = this.start[0];
		this.y = this.start[1];
	    } else if (this.activate_key) {
		this.finished = true;
		this.current_frame = "finished";
		remaining--;
		if (remaining == 0) {
		    game_messages.push
		    (new Game_Msg("All paths completed!\n" +
				  "(Press Space to continue)",
				  "white"));
		}
	    } else {
		this.finished = true;
	    }
	    return;
	}
    };

function key_press (event) {
    keys[event.which] = true;
    keys[chr(event.which)] = true;
    switch (event.which) {
    case ord('P'):
	if (stop) {
	    break;
	}
	if (paused) {
	    paused = false;
	    game_messages.shift ();
	    start_main_loop ();
	} else {
	    paused = true;
	    game_messages.push (new Game_Msg ("Paused", "yellow"));
	}
	break;
    case KEY.SPACE:
	if (collision) {
	    collision = false;
	    current_level = 1;
	    lookup_load_level ();
	} else if (remaining == 0 && stop == false) {
	    current_level++;
	    lookup_load_level ();
	}
	break;
    case KEY.RETURN:
	n = parseInt (prompt ("Level:"));
	if (!isNaN(n)) {
	    current_level = n;
	    lookup_load_level ();
	}
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
    }
}

function get_levels (data) {
    var level_sets = JSON.parse (data);

    for (var set in level_sets) {
	var selected = false;
	if (level_sets[set].directory == level_directory) {
	    selected = true;
	}
	$("#levelset").append (new Option (level_sets[set].name,
					   level_sets[set].directory,
					   selected));
	if (selected) {
	    $("#levelset").val (level_sets[set].directory);
	}
    }
}

function get_query(parameter) { 
    var loc = location.search.substring(1, location.search.length);
    var param_value = false;
    var params = loc.split("&");
    for (i=0; i<params.length;i++) {
	param_name = params[i].substring(0,params[i].indexOf('='));
	if (param_name == parameter) {
            param_value = params[i].substring(params[i].indexOf('=')+1);
	}
    }
    if (param_value) {
	return param_value;
    }
    else {
	return false; //Here determine return if no parameter is found
    }
}

function init () {
    canvas = document.getElementById("canvas");

    level_directory = get_query ("levelset");
    if (level_directory == "%28none%29") {
	level_directory = prompt ("What level set?", "levels");
	location.search = "?levelset=" + level_directory;
    }
    if (level_directory == false) {
	level_directory = "levels";
    }

    $.post ("levels.json", get_levels);

    goal = load_image ("goal.png");

    current_level = 1;
    lookup_load_level ();

    start_main_loop ();
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
