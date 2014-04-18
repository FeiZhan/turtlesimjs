var Turtle = (function() {

  var Turtle = function(options) {
    var that = this;
    options = options || {};
    that.ros     = options.ros;
    that.name    = options.name;
    that.context = options.context;

    // Keeps track of the turtle's current position and velocity.
    that.orientation = 0;
    that.angularVelocity = 0;
    that.linearVelocity  = 0;
    that.pose = new that.ros.Message({
      x : that.context.canvas.width / 2
    , y : that.context.canvas.height / 2
    });

    // Subscribes to the Velocity topic, which act as // directions to the
    // turtle.
    that.velocityTopic = new that.ros.Topic({
      name        : '/' + that.name + '/command_velocity'
    , messageType : 'turtlesim/Velocity'
    });
    that.velocityTopic.subscribe(that.onVelocity.bind(that));

    // Represents the turtle as a PNG image.
    that.image = new Image();
    that.image.src = 'images/robot-turtle.png';
    that.draw();
  };
  Turtle.prototype.__proto__ = EventEmitter2.prototype;

  Turtle.prototype.onVelocity = function(message) {
    this.linearVelocity  = message.linear;
    this.angularVelocity = message.angular;
    this.orientation = (this.orientation + this.angularVelocity) % (2 * Math.PI);

    var pose = new this.ros.Message();
    pose.x = this.pose.x
      + Math.sin(this.orientation + (Math.PI / 2)) * this.linearVelocity;
    pose.y = this.pose.y 
      + Math.cos(this.orientation + (Math.PI / 2)) * this.linearVelocity;
    pose.theta = this.orientation;
    pose.linear_velocity = this.linearVelocity;
    pose.angular_velocity = this.angularVelocity;
    this.pose = pose;

    var poseTopic = new this.ros.Topic({
      name        : '/' + this.name + '/pose'
    , messageType : 'turtlesim/Pose'
    });
    poseTopic.publish(pose);
    this.emit('dirty');
  };

  Turtle.prototype.draw = function() {
    this.context.save();
    var x = this.pose.x;
    var y = this.pose.y;
    var imageWidth  = this.image.width;
    var imageHeight = this.image.height;

    this.context.translate(x, y);
    this.context.rotate(-this.orientation);
    this.context.drawImage(
      this.image
    , -(imageWidth / 2)
    , -(imageHeight / 2)
    , imageWidth
    , imageHeight
    );
    this.context.restore();
  };

  Turtle.prototype.moveForward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : 5
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveBackward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : -5
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveRight = function() {
    var velocity = new this.ros.Message({
      angular : -0.3
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveLeft = function() {
    var velocity = new this.ros.Message({
      angular : 0.3
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  return Turtle;
}());

