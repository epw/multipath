var canvas;
var main_loop;

var keys = {};

var path_followers = [];

Follower.prototype = new Game_Object;
function Follower (activate_key, x, y, path) {
    Game_Object.call (this, this.local_draw, 1, x, y, 0, "circle");
    this.image = load_image ("sphere.png");
    this.activate_key = activate_key;
    this.start = [x, y];
    this.speed = 2;
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
	if (this.pathid == this.path.length) {
	    this.finished = true;
	    return;
	}

	if (keys[this.activate_key]) {
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
    };
Follower.prototype.local_draw =
    function (ctx) {
	if (this.finished) {
	    ctx.save ();
	    ctx.fillStyle = "rgb(255, 255, 0)";
	    ctx.beginPath ();
	    ctx.arc (0, 0, 22, 0, Math.PI * 2, false);
	    ctx.fill ();
	    ctx.restore ();
	}
	safe_draw_image (ctx, this.image,
			 -this.w() / 2, -this.h() / 2,
			 this.image.width, this.image.height);

	ctx.font = "20px Times New Roman";
	ctx.fillStyle = "rgb(255, 255, 0)";
	w = ctx.measureText (this.activate_key);
	ctx.fillText(this.activate_key, -w.width / 2, 4);
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
	log (path_followers[0].vx + ", " + path_followers[0].vy);
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


    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
