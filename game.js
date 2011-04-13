var collision = false;
var paused = false;
var stop = false;

var remaining = 0;

var max_level = 3;

function win () {
    game_messages.push (new Game_Msg("All levels completed!\n" +
				     "You win!",
				     "rgb(0, 175, 0)"));
    stop = true;
}

function load_level () {
    path_followers = [];
    game_messages = [];
    remaining = 0;

    switch (current_level) {
    case 1:
	path_followers.push (new Follower ('A', null, 50, 300,
					   [[750, 300]]));
	for (var x = 200; x <= 600; x += 100) {
	    path_followers.push (new Follower (null, null, x, 100,
					       [[x, 500],
						[x, 100]],
					       true));
	    path_followers[path_followers.length - 1].y = 100 + (x - 200);
	}
	break;
    case 2:
	path_followers.push (new Follower ('A', null, 200, 150,
					   [[200, canvas.height - 150],
					    [canvas.width - 200,
					     canvas.height - 150],
					    [canvas.width - 200, 150],
					    [200, 150]]));

	path_followers.push (new Follower (null, null, 100, canvas.height / 2,
					   [[canvas.width - 100,
					     canvas.height / 2],
					    [100, canvas.height / 2]],
					   true));
	path_followers.push (new Follower (null, null, canvas.width / 2, 100,
					   [[canvas.width / 2,
					     canvas.height - 100],
					    [canvas.width / 2, 100]],
					   true));
	break;
    case 3:
	path_followers.push (new Follower ('A', null, 100, canvas.height / 2,
					   [[canvas.width - 100,
					     canvas.height / 2]]));
	path_followers.push (new Follower ('A', null, canvas.width / 2, 100,
					   [[canvas.width / 2,
					     canvas.height - 100]]));

	path_followers.push (new Follower (null, null, 200, 150,
					   [[200, canvas.height - 150],
					    [canvas.width - 200,
					     canvas.height - 150],
					    [canvas.width - 200, 150],
					    [200, 150]],
					   true));
	path_followers.push (new Follower (null, null, 200, canvas.height - 150,
					   [[canvas.width - 200,
					     canvas.height - 150],
					    [canvas.width - 200, 150],
					    [200, 150],
					    [200, canvas.height - 150]],
					   true));
	path_followers.push (new Follower (null, null, canvas.width - 200,
					   canvas.height - 150,
					   [[canvas.width - 200, 150],
					    [200, 150],
					    [200, canvas.height - 150],
					    [canvas.width - 200,
					     canvas.height - 150]],
					   true));
	path_followers.push (new Follower (null, null, canvas.width - 200, 150,
					   [[200, 150],
					    [200, canvas.height - 150],
					    [canvas.width - 200,
					     canvas.height - 150],
					    [canvas.width - 200, 150]],
					   true));
	break;
    default:
	win ();
    }
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
	    } else {
		this.finished = true;
		this.current_frame = "finished";
		remaining--;
		if (remaining == 0) {
		    if (current_level == max_level) {
			game_messages = [];
			win ();
		    } else {
			game_messages.push
			(new Game_Msg("All paths completed!\n" +
				      "(Press Space to continue)",
				      "white"));
		    }
		}
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
	    load_level ();
	} else if (remaining == 0 && stop == false) {
	    current_level++;
	    load_level ();
	}
	break;
    case KEY.RETURN:
	n = parseInt (prompt ("Level:"));
	if (!isNaN(n)) {
	    current_level = n;
	    load_level ();
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

function init () {
    canvas = document.getElementById("canvas");

    goal = load_image ("goal.png");

    current_level = 1;
    load_level ();

    start_main_loop ();
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
