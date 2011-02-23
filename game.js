var canvas;
var main_loop;

var keys = {};

var screen_clip = {"x": 0, "y": 0, "w": 800, "h": 600};

var game_msg = null;

var path_followers = [];

var remaining = 0;

Follower.prototype = new Game_Object;
function Follower (activate_key, x, y, path, loop) {
//    Game_Object.call (this, this.local_draw, 1, x, y, 0, "circle");
    Game_Object.call (this, ["sphere.png", "tint-sphere.png"], 1, x, y, 0,
		      "circle");
//    this.image = load_image ("sphere.png");
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
    this.speed = 10;
    if (path) {
	this.path = path;
    } else {
	this.path = [];
    }
    this.pathid = 0;
    this.finished = false;
}
Follower.prototype.update =
    function () {
	if (this.finished) {
	    return;
	}

	if (keys[this.activate_key] || this.activate_key == null) {
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
	    if (path_followers[f] == this) {
		continue;
	    }
	    if (this.touching (path_followers[f])) {
		game_messages.push (new Game_Msg ("Collision!", "red", null,
						  true));
		clearInterval (main_loop);
	    }
	}

	if (this.pathid == this.path.length) {
	    if (this.loop) {
		this.pathid = 0;
		this.x = this.start[0];
		this.y = this.start[1];
	    } else {
		this.finished = true;
		this.current_frame++;
		remaining--;
		if (remaining == 0) {
		    game_messages.push (new Game_Msg ("All paths completed!",
						      "white"));
		    clearInterval (main_loop);
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
	    ctx.font = "20px Times New Roman";
	    ctx.fillStyle = "rgb(255, 255, 0)";
	    w = ctx.measureText (this.activate_key);
	    ctx.fillText(this.activate_key, -w.width / 2, 4);
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
	ctx.save ();
	ctx.strokeStyle = "rgb(96, 96, 96)";
	ctx.lineWidth = 4;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.beginPath ();
	ctx.moveTo (path_followers[f].start[0], path_followers[f].start[1]);
	for (path in path_followers[f].path) {
	    ctx.lineTo (path_followers[f].path[path][0],
			path_followers[f].path[path][1]);
	}
	ctx.stroke ();
	ctx.restore ();
    }

    for (f in path_followers) {
	path_followers[f].draw (ctx);
    }

    draw_game_message ();
}

function update () {
    for (f in path_followers) {
	path_followers[f].update ();
    }

    draw ();
}

function key_press (event) {
    keys[event.which] = true;
    keys[chr(event.which)] = true;
    switch (event.which) {
    case KEY.SPACE:
	game_messages.push (new Game_Msg ("Space", "white", null, 30));
	break;
    }
}
function key_release (event) {
    keys[event.which] = false;
    keys[chr(event.which)] = false;
    switch (event.which) {
    case KEY.ESCAPE:
	clearInterval (main_loop);
	log ("Stopped");
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    path_followers.push (new Follower('A', 50, 50, [[400, 50],
						    [400, 500],
						    [700, 500]]));
    path_followers.push (new Follower('S', 50, 500, [[300, 500],
						     [500, 200],
						     [700, 200]]));


    path_followers.push (new Follower(null, 50, 300, [[100, 300],
						      [50, 300]], true));

    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
