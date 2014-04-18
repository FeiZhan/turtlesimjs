var TURTLESIMJS = TURTLESIMJS || new Object();

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

	// Keeps track of the turtle's current position and velocity
	that.pose = new ROSLIB.Message({
		x				: options.pose.x				|| that.context.canvas.width / 2,
		y				: options.pose.y				|| that.context.canvas.height / 2,
		theta			: options.pose.theta			|| 0,
		linear_velocity	: options.pose.linear_velocity	|| 0,
		angular_velocity: options.pose.angular_velocity	|| 0,
	});

    // Subscribe to the Velocity topic
    that.velTopic = new ROSLIB.Topic({
		ros : that.ros,
		name        : '/' + that.name + '/cmd_vel',
		messageType : 'geometry_msgs/Twist',
    });
    that.velTopic.subscribe(that.onVel.bind(that));

    // represents the turtle as a PNG image
    that.image = new Image();
    that.image.src = options.img || TURTLESIMJS.TURTLE_IMAGES[Math.floor(Math.random() * TURTLESIMJS.TURTLE_IMAGES.length)];
    that.image.width = Math.min(that.image.width, 50);
    that.image.height = Math.min(that.image.height, 50);
};

// inherit from EventEmitter2
TURTLESIMJS.Turtle.prototype.__proto__ = EventEmitter2.prototype;

TURTLESIMJS.Turtle.prototype.update = function () {
	this.pose.x = Math.min(Math.max(this.pose.x, 0), this.context.canvas.width);
	this.pose.y = Math.min(Math.max(this.pose.y, 0), this.context.canvas.height);
	var pose_topic = new ROSLIB.Topic({
		ros			: this.ros,
		name        : '/' + this.name + '/pose',
		messageType : 'turtlesim/Pose',
	});
	pose_topic.publish(this.pose);
}

TURTLESIMJS.Turtle.prototype.draw = function () {
	var that = this;
	that.context.save();
	var x = that.pose.x;
	var y = that.pose.y;
	var imageWidth  = that.image.width;
	var imageHeight = that.image.height;
	that.context.translate(x, y);
	that.context.rotate(- that.pose.theta);
	that.context.drawImage(
		that.image,
		-(imageWidth / 2),
		-(imageHeight / 2),
		imageWidth,
		imageHeight
	);
	that.context.restore();
};

TURTLESIMJS.Turtle.prototype.onVel = function (message) {
	var that = this;
	that.pose.linear_velocity  = message.linear.x;
	that.pose.angular_velocity = message.angular.z;
	that.pose.theta = (that.pose.theta + that.pose.angular_velocity) % (2 * Math.PI);
	that.pose.x += - Math.sin(this.pose.theta) * this.pose.linear_velocity;
	that.pose.y += - Math.cos(this.pose.theta) * this.pose.linear_velocity;
	that.emit('dirty');
};

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
			z	: -.3,
		},
	});
    this.velTopic.publish(velocity);
  };

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
			z	: .3,
		},
	});
    this.velTopic.publish(velocity);
  };
