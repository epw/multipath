var collision = false;
var paused = false;
var stop = false;

var remaining = 0;

var levelset_data = {};
var level_data = {};

function win () {
    current_level = "-";
    game_messages.push (new Game_Msg("All levels completed!\n" +
				     "You win!",
				     "rgb(0, 175, 0)"));
    stop = true;
}

function play_music (song) {
    level_music = new Audio ("music/" + song);
    level_music.loop =  true;
    level_music.play();
}

function get_option (option) {
    if (typeof (level_data[option]) != "undefined") {
	return level_data[option];
    } else if (typeof (levelset_data[option]) != "undefined") {
	return levelset_data[option];
    }
    return null;
}

function display_field (field, label) {
    $("#level").append ("<div><span class='label'>" + label + ":</span> "
			+ get_option (field) + "</div>");
}

function display_level_data () {
    $("#level").html ("");
    display_field ("author", "Level Author");

    if (typeof (level_data["music"]) != "undefined") {
	play_music (level_data["music"]);
    }
}

function parse_level (data) {
    if (data.search ("// JavaScript") == 0) {
	eval (data);
    } else {
	level_data = load_level (data);
	path_followers = level_data.paths;
    }

    for (f in path_followers) {
	if (path_followers[f].activate_key) {
	    remaining++;
	}
    }

    display_level_data ();
}

function lookup_load_level () {
    path_followers = [];
    game_messages = [];
    remaining = 0;

    $.get ("levelsets/" + level_directory + "/" + current_level + '.lvl', parse_level)
	.error (win);

}

function load_specific_level (specific_level) {
    path_followers = [];
    game_messages = [];
    remaining = 0;

    $.get("loose_levels/" + specific_level, parse_level);
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
		game_messages.push (new Game_Msg ("Collision!\n(Press Space or N to restart)", "red"));
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
				  "(Press Space or N to continue)",
				  "white"));
		}
	    } else {
		this.finished = true;
	    }
	    return;
	}
    };

function first_level () {
    if (isFinite (current_level)) {
	current_level = 1;
	lookup_load_level ();
    } else {
	load_specific_level (current_level);
    }
}

function restart_level () {
    if (isFinite (current_level)) {
	lookup_load_level ();
    } else if (current_level == "[direct]") {
	load_and_parse_level ();
    } else {
	load_specific_level (current_level);
    }
}

function next_level () {
    current_level++;
    lookup_load_level ();
}

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
    case ord('N'):
    case KEY.SPACE:
	if (collision) {
	    collision = false;
	    restart_level ();
	} else if (remaining == 0 && stop == false) {
	    next_level ();
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
	if (confirm ("Really kill main loop?\n(Will abandon your progress, but could help if there is a bug)")) {
	    clearInterval (main_loop);
	}
	break;
    }
}

function get_levelset (data) {
    var config = JSON.parse (data);

    $("#levelset > *[value='" + config.directory + "']").text (config.name);

    if (config.directory == level_directory) {
	levelset_data = config;
	if (typeof(levelset_data["music"]) != "undefined") {
	    play_music (levelset_data.music);
	}
    }
    display_level_data ();
}

function parse_listing () {
    return $(this).parent().siblings().first().text();
}

function get_levelsets (data) {
    var level_sets = $(data).find("tr > td > img[alt='[DIR]']").map (parse_listing);

    for (var set = 0; set < level_sets.length; set++) {
	var selected = false;

	if (level_sets[set] == "Parent Directory") {
	    continue;
	}

	level_sets[set] = level_sets[set].slice (0, -1);

	if (level_sets[set] == level_directory) {
	    selected = true;
	}
	$("#levelset").append (new Option (level_sets[set], level_sets[set],
					   selected));

	if (selected) {
	    $("#levelset").val(level_sets[set]);
	}

	$.get ("levelsets/" + level_sets[set] + "/config", get_levelset);
    }
}

function query_str(parameter) { 
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

function mute () {
    if (level_music) {
	level_music.pause ();
    }
    $("#mute").css ("display", "none");
    $("#unmute").css ("display", "inline");
}

function unmute () {
    if (level_music) {
	level_music.play ();
    }
    $("#mute").css ("display", "inline");
    $("#unmute").css ("display", "none");
}

function unhide_loading () {
    $("div.loadhidden").css ("display", "block");
    $("#directlevel").val("");
}

function load_and_parse_level () {
    path_followers = [];
    game_messages = [];
    remaining = 0;

    current_level = "[direct]";
    parse_level ($("#directlevel").val());
}

function init () {
    var specific_level = false;

    $("#mute").click (mute);
    $("#unmute").click (unmute);
    $("#unmute").css ("display", "none");

    $("#loadtext").click (unhide_loading);
    $("#load").click (load_and_parse_level);

    canvas = document.getElementById("canvas");

    goal = load_image ("goal.png");

    level_directory = query_str ("levelset");
    if (level_directory == "%28none%29") {
	level_directory = prompt ("What level set?", "original");
	location.search = "?levelset=" + level_directory;
    }
    if (level_directory == false) {
	specific_level = query_str ("level");
	if (specific_level != false) {
	    current_level = specific_level;
	    load_specific_level (current_level);
	} else {
	    level_directory = "original";
	}
    }

    $.get ("levelsets/", get_levelsets);

    if (specific_level == false) {

	current_level = 1;
	lookup_load_level ();
    }

    start_main_loop ();
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
