//@todo service

var TURTLESIMJS = TURTLESIMJS || new Object();
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
	this.fill = options.fill || "Blue";
	this.turtleList  = new Object();
	this.turtle = null;
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
};

TURTLESIMJS.TurtleSim.prototype.updateInterval = function (interval) {
	setInterval(this.update.bind(this), interval);
	return this;
}

TURTLESIMJS.TurtleSim.prototype.update = function (interval) {
	for (var i in this.turtleList) {
		this.turtleList[i].update();
	}
	this.draw();
}

TURTLESIMJS.TurtleSim.prototype.draw = function () {
	this.context.fillStyle = this.fill;
	this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	// draw each turtle
	for (var i in this.turtleList) {
		this.turtleList[i].draw();
	}
	return this;
}

TURTLESIMJS.TurtleSim.prototype.spawnTurtle = function (options) {
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
	that.turtleList[options.name] = new TURTLESIMJS.Turtle({
		ros     : that.ros,
		context : that.context,
		name    : options.name,
		pose    : initial_pose,
		img		: options.img
	});
	that.turtle = that.turtleList[options.name];
	// refresh the canvas
	//that.turtle.on('dirty', that.draw.bind(that));
	return that;
};

TURTLESIMJS.TurtleSim.prototype.hasTurtle = function (name) {
	return undefined !== this.turtleList[name];
};
