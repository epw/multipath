var canvas;
var main_loop;

var keys = {};

var player;

Follower.prototype = new Game_Object;
function Follower () {
    Game_Object.call (this);
    
}
Follower.prototype.update =
    function () {
	Game_Object.prototype.update ();
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
}

function update () {
    draw ();
}

function key_press (event) {
    keys[event.which] = true;
    switch (event.which) {
    }
}
function key_release (event) {
    keys[event.which] = false;
    switch (event.which) {
    case KEY.ESCAPE:
	clearInterval (main_loop);
	log ("Stopped");
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
