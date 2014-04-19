var TURTLESIMJS = TURTLESIMJS || new Object();
// a list of images for turtles
TURTLESIMJS.TURTLE_IMAGES = [
	"img/box-turtle.png",
	"img/diamondback.png",
	"img/electric.png",
	"img/fuerte.png",
	"img/groovy.png",
	"img/hydro.png",
	"img/robot-turtle.png",
	"img/sea-turtle.png",
	"img/turtle.png"
];
// default background color
TURTLESIMJS.DEFAULT_BG = "#4556FF";
// the canvas size of turtlesim
TURTLESIMJS.CANVAS = {
	height: 11,
	width: 11,
};
// turtle simulator
TURTLESIMJS.TurtleSim = function (options) {
	var that = this;
	options = options || {};
	that.ros = options.ros;
	that.context = options.context;
	if (undefined === that.ros || undefined === that.context) {
		console.error("invalid options");
		return;
	}
	this.keyControl = options.keyControl || false;
	this.fill = options.fill || TURTLESIMJS.DEFAULT_BG;
	this.turtleList  = new Object();
	this.turtle = null;
	// if allow keyboard to control
	if (this.keyControl) {
		// use keyboard to control turtle
		document.onkeydown = function (event) {
			var key_code = event.keyCode || event.which;
			var arrow  = { left: 37, up: 38, right: 39, down: 40 };
			switch (key_code) {
			case arrow.up:
				that.turtle.moveForward();
				break;
			case arrow.down:
				that.turtle.moveBackward();
				break;
			case arrow.left:
				that.turtle.moveLeft();
				break;
			case arrow.right:
				that.turtle.moveRight();
				break;
			}
		};
	}
	this.updateInterval(options.interval || 100);
};
// update canvas in interval
TURTLESIMJS.TurtleSim.prototype.updateInterval = function (interval) {
	setInterval(this.update.bind(this), interval);
	return this;
}
// update turtlesim
TURTLESIMJS.TurtleSim.prototype.update = function (interval) {
	// update each turtle
	for (var i in this.turtleList) {
		this.turtleList[i].update();
	}
	this.draw();
}
// draw turtlesim
TURTLESIMJS.TurtleSim.prototype.draw = function () {
	// fill background color
	this.context.fillStyle = this.fill;
	this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	// get color and set to param
	var color = this.context.fillStyle.match(/^#([0-9a-f]{6})$/i)[1];
	// if color changed
    if (color && color != this.fill) {
		this.fill = color;
		// set to param
		var background_r = new ROSLIB.Param({
			ros : this.ros,
			name : 'background_r'
		});
		background_r.set( parseInt(color.substr(0, 2), 16) );
		var background_g = new ROSLIB.Param({
			ros : this.ros,
			name : 'background_g'
		});
		background_g.set( parseInt(color.substr(2, 2), 16) );
		var background_b = new ROSLIB.Param({
			ros : this.ros,
			name : 'background_b'
		});
		background_b.set( parseInt(color.substr(4, 2), 16) );
	}
	// draw each turtle
	for (var i in this.turtleList) {
		this.turtleList[i].draw();
	}
	// return itself to allow chain call
	return this;
}
// create a turtle
TURTLESIMJS.TurtleSim.prototype.spawnTurtle = function (options) {
	// if name exists
	if (this.hasTurtle(options.name)) {
		console.error("invalid name");
		return;
	}
	var that = this;
	options = options || {};
	var initial_pose = {
		x		: options.x		|| that.context.canvas.width / 2,
		y		: options.y		|| that.context.canvas.height / 2,
		theta	: options.theta	|| 0,
	};
	// create a turtle
	that.turtleList[options.name] = new TURTLESIMJS.Turtle({
		ros     : that.ros,
		context : that.context,
		name    : options.name,
		pen	    : options.pen,
		pose    : initial_pose,
		img		: options.img
	});
	// set turtle to the latest one
	that.turtle = that.turtleList[options.name];
	return that;
};
// if a turtle name exists
TURTLESIMJS.TurtleSim.prototype.hasTurtle = function (name) {
	return undefined !== this.turtleList[name];
};
// clear background color
TURTLESIMJS.TurtleSim.prototype.onClear = function () {
	this.fill = TURTLESIMJS.DEFAULT_BG;
	this.draw();
}
// clear and reset turtles
TURTLESIMJS.TurtleSim.prototype.onReset = function () {
	var that = this;
	this.fill = TURTLESIMJS.DEFAULT_BG;
	// reset turtles to init pose
	for (var i in this.turtleList) {
		this.turtleList[i].pose.x = that.context.canvas.width / 2;
		this.turtleList[i].pose.y = that.context.canvas.height / 2;
		this.turtleList[i].pose.theta = 0;
	}
	this.draw();
}
// remove a turtle
TURTLESIMJS.TurtleSim.prototype.onKill = function (name) {
	if (name in this.turtleList) {
		delete this.turtleList[name];
		this.draw();
	}
};
