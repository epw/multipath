var canvas;
var main_loop;

var keys = {};

var screen_clip = {"x": 0, "y": 0, "w": 800, "h": 600};

var path_followers = [];

var current_level;

var goal;

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
