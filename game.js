var canvas;
var main_loop;

var keys = {};

var screen_clip = {"x": 0, "y": 0, "w": 800, "h": 600};

var collision = false;
var paused = false;
var stop = false;

var path_followers = [];

var goal;

var remaining = 0;

var current_level = 1;
var max_level = 3;
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
	game_messages.push (new Game_Msg("All levels completed!\n" +
					"You win!",
					"rgb(0, 200, 0)"));
	stop = true;
    }
}

Follower.prototype = new Game_Object;
function Follower (activate_key, frames, x, y, path, loop) {
    if (frames == null) {
	frames = {'0': "sphere.png", 'finished': "tint-sphere.png",
		  'collision': "stop-sphere.png"};
//	frames = ["sphere.png", "tint-sphere.png", "stop-sphere.png"];
    }
    Game_Object.call (this, frames, 1, x, y, 0, "circle");
    this.activate_key = activate_key;
    if (this.activate_key) {
	remaining++;
    }
    this.start = [x, y];
    if (loop != undefined) {
	this.loop = loop;
    } else {
	this.loop = false;
    }
    this.speed = 3;
    if (path) {
	this.path = path;
    } else {
	this.path = [];
    }
    this.pathid = 0;
    this.finished = false;
    this.stopped = false;
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
			game_messages.push
			(new Game_Msg("All levels completed!\n" +
				      "You win!",
				      "rgb(0, 200, 0)"));
			stop = true;
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
Follower.prototype.draw =
    function (ctx) {
	Game_Object.prototype.draw.call (this, ctx);

	if (this.activate_key != null) {
	    ctx.save ();
	    ctx.translate (this.x, this.y);
	    ctx.font = "20px Sans";
	    ctx.fillStyle = "rgb(255, 255, 0)";
	    w = ctx.measureText (this.activate_key);
	    ctx.fillText(this.activate_key, -w.width / 2 - 1, 5);
	    ctx.restore ();
	}
    };
Follower.prototype.draw_path =
    function (ctx) {
	ctx.save ();

	// Color of path depends on whether it is human-controlled.
	if (this.activate_key == null) {
	    ctx.strokeStyle = "rgb(40, 40, 40)";
	} else {
	    ctx.strokeStyle = "rgb(100, 100, 100)";
	}
	ctx.lineWidth = 4;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.beginPath ();
	ctx.moveTo (this.start[0], this.start[1]);
	for (path in this.path) {
	    ctx.lineTo (this.path[path][0],
			this.path[path][1]);
	}
	ctx.stroke ();
	ctx.restore ();

	// Only draw goal for human-controlled paths
	if (this.activate_key != null) {
	    ctx.save ();
	    ctx.globalAlpha = .5;
	    ctx.translate (this.path[this.path.length-1][0],
			   this.path[this.path.length-1][1]);
	    ctx.drawImage (goal, -goal.width / 2, -goal.height / 2);
	    ctx.restore ();
	}
    };

function log (s) {
    $("#log").append ("<div class=\"logentry\">");
    $("#log").append ("<span class=\"logtimestamp\">"
		      + Math.floor((new Date()).getTime() / 1000) + "</span> ");
    $("#log").append (s  + "</div>\n");
}

function draw () {
    ctx = canvas.getContext ('2d');

    ctx.save ();

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.restore ();

    for (f in path_followers) {
	path_followers[f].draw_path (ctx);
    }

    for (f in path_followers) {
	path_followers[f].draw (ctx);
    }

    ctx.save ();
    ctx.font = "14pt Sans";
    ctx.fillStyle = "blue";
    w = ctx.measureText ("Level ");
    ctx.fillText ("Level " + current_level, canvas.width - w.width - 30, 25);
    ctx.restore ();

    draw_game_message (ctx, canvas);
}

function update () {
    if (paused || stop) {
	stop_main_loop ();
    }

    for (f in path_followers) {
	path_followers[f].update ();
    }

    draw ();
}

function start_main_loop () {
    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}
function stop_main_loop () {
    clearInterval (main_loop);
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
