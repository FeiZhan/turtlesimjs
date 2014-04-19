var TURTLESIMJS = TURTLESIMJS || new Object();
// default config for a pen
TURTLESIMJS.DEFAULT_PEN = {
	color: "#b3b8ff",
	width: "3",
	off: false,
};
// max size of a turtle image
TURTLESIMJS.IMAGE_MAX = {
	width: 45,
	height: 45
};
// a turtle
TURTLESIMJS.Turtle = function (options) {
	var that = this;
	options = options || {};
	that.ros = options.ros;
	that.context = options.context;
    if (undefined === that.ros || undefined === that.context) {
		console.error("invalid");
		return;
	}
	that.name = options.name;
	that.pen = options.pen || TURTLESIMJS.DEFAULT_PEN;
	// turtle trajectory
	that.traj = new Array();
	// the time when last command comes
	that.cmd_time = undefined;
	// the time of last update
	that.last_time = new Date();
	// turtle's current position and velocity
	that.pose = new ROSLIB.Message({
		x				: options.pose.x				|| that.context.canvas.width / 2,
		y				: options.pose.y				|| that.context.canvas.height / 2,
		theta			: options.pose.theta			|| 0,
		linear_velocity	: options.pose.linear_velocity	|| 0,
		angular_velocity: options.pose.angular_velocity	|| 0,
	});
    // subscribe to the Velocity topic
    that.velTopic = new ROSLIB.Topic({
		ros : that.ros,
		name        : '/' + that.name + '/cmd_vel',
		messageType : 'geometry_msgs/Twist',
    });
    that.velTopic.subscribe(that.onVel.bind(that));
    // represents the turtle as a PNG image
    that.image = new Image();
    // a random source file
    that.image.src = options.img || TURTLESIMJS.TURTLE_IMAGES[Math.floor(Math.random() * TURTLESIMJS.TURTLE_IMAGES.length)];
    // zoom image to max size
    if (that.image.width > TURTLESIMJS.IMAGE_MAX.width) {
		that.image.height *= TURTLESIMJS.IMAGE_MAX.width / that.image.width;
		that.image.width = TURTLESIMJS.IMAGE_MAX.width;
	}
    if (that.image.height > TURTLESIMJS.IMAGE_MAX.height) {
		that.image.width *= TURTLESIMJS.IMAGE_MAX.height / that.image.height;
		that.image.height = TURTLESIMJS.IMAGE_MAX.height;
	}
	if (0 == that.image.height) {
		that.image.height = TURTLESIMJS.IMAGE_MAX.height;
	}
	if (0 == that.image.width) {
		that.image.width = TURTLESIMJS.IMAGE_MAX.width;
	}
};
// update its pose
TURTLESIMJS.Turtle.prototype.update = function () {
	var that = this;
	// a command exists for 1000 ms
	if (new Date() - that.cmd_time > 1000) {
		that.pose.linear_velocity  = 0;
		that.pose.angular_velocity = 0;
	}
	// time since last update
	var dt = (new Date() - this.last_time) / 1000;
	this.last_time = new Date();
	// rotate by angular_velocity
	that.pose.theta = (that.pose.theta + that.pose.angular_velocity * dt) % (2 * Math.PI);
	// move by linear_velocity, zoom to canvas size
	that.pose.x += Math.sin(this.pose.theta + Math.PI / 2) * this.pose.linear_velocity * dt * this.context.canvas.width / TURTLESIMJS.CANVAS.width;
	that.pose.y += Math.cos(this.pose.theta + Math.PI / 2) * this.pose.linear_velocity * dt * this.context.canvas.height / TURTLESIMJS.CANVAS.height;
	// clamp within canvas
	this.pose.x = Math.min(Math.max(this.pose.x, 0), this.context.canvas.width);
	this.pose.y = Math.min(Math.max(this.pose.y, 0), this.context.canvas.height);
	// publish pose
	var pose_topic = new ROSLIB.Topic({
		ros			: this.ros,
		name        : '/' + this.name + '/pose',
		messageType : 'turtlesim/Pose',
	});
	pose_topic.publish(this.pose);
}
// draw a turtle
TURTLESIMJS.Turtle.prototype.draw = function () {
	var that = this;
	that.context.save();
	that.context.beginPath();
	// redraw previous paths
	for (var i = 1; i < that.traj.length; ++ i) {
		that.context.moveTo(that.traj[i - 1].x, that.traj[i - 1].y);
		that.context.lineTo(that.traj[i].x, that.traj[i].y);
	}
	// if needs pen
	if (! that.pen.off) {
		// deep clone
		var pose_temp = JSON.parse(JSON.stringify(that.pose));
		var last = that.traj.length > 0 ? that.traj[that.traj.length - 1] : undefined;
		if (0 == that.traj.length) {
			that.traj.push(pose_temp);
		}
		// if position changes
		else if (last.x != that.pose.x || last.y != that.pose.y) {
			// draw the new path
			that.context.moveTo(last.x, last.y);
			that.context.lineTo(that.pose.x, that.pose.y);
			that.traj.push(pose_temp);
		}
	}
	// set pen color
	that.context.strokeStyle = that.pen.color;
	that.context.stroke();
	// draw turtle image
	var x = that.pose.x;
	var y = that.pose.y;
	var imageWidth  = that.image.width;
	var imageHeight = that.image.height;
	that.context.translate(x, y);
	that.context.rotate(- that.pose.theta + Math.PI / 2);
	that.context.drawImage(
		that.image,
		-(imageWidth / 2),
		-(imageHeight / 2),
		imageWidth,
		imageHeight
	);
	that.context.restore();
};
// when the velocity changes
TURTLESIMJS.Turtle.prototype.onVel = function (message) {
	var that = this;
	that.pose.linear_velocity  = message.linear.x;
	that.pose.angular_velocity = message.angular.z;
	that.cmd_time = new Date();
};
// move forward
TURTLESIMJS.Turtle.prototype.moveForward = function () {
	var velocity = new ROSLIB.Message({
		linear	: {
			x	: 2,
			y	: 0,
			z	: 0,
		},
		angular	: {
			x	: 0,
			y	: 0,
			z	: 0,
		},
	});
	this.velTopic.publish(velocity);
};
// move backward
TURTLESIMJS.Turtle.prototype.moveBackward = function() {
	var velocity = new ROSLIB.Message({
		linear	: {
			x	: -2,
			y	: 0,
			z	: 0,
		},
		angular	: {
			x	: 0,
			y	: 0,
			z	: 0,
		},
	});
    this.velTopic.publish(velocity);
  };
// move right
TURTLESIMJS.Turtle.prototype.moveRight = function() {
	var velocity = new ROSLIB.Message({
		linear	: {
			x	: 0,
			y	: 0,
			z	: 0,
		},
		angular	: {
			x	: 0,
			y	: 0,
			z	: -2,
		},
	});
    this.velTopic.publish(velocity);
};
// move left
TURTLESIMJS.Turtle.prototype.moveLeft = function() {
	var velocity = new ROSLIB.Message({
		linear	: {
			x	: 0,
			y	: 0,
			z	: 0,
		},
		angular	: {
			x	: 0,
			y	: 0,
			z	: 2,
		},
	});
	this.velTopic.publish(velocity);
};
// set pen config
TURTLESIMJS.Turtle.prototype.onSetPen = function (color, width, off) {
	this.pen.color = color || this.pen.color;
	this.pen.width = width || this.pen.width;
	this.pen.off = undefined !== off ? off : this.pen.off;
};
// teleport to an absolute pose
TURTLESIMJS.Turtle.prototype.onTeleportAbsolute = function (x, y, theta) {
	this.pose.x = undefined !== x ? x : this.pose.x;
	this.pose.y = undefined !== y ? y : this.pose.y;
	this.pose.theta = undefined !== theta ? theta : this.pose.theta;
	this.update();
};
// teleport to an relative pose
TURTLESIMJS.Turtle.prototype.onTeleportRelative = function (linear, angular) {
	var that = this;
	that.pose.theta = (that.pose.theta + angular) % (2 * Math.PI);
	that.pose.x += - Math.sin(this.pose.theta) * linear;
	that.pose.y += - Math.cos(this.pose.theta) * linear;
	this.update();
};
