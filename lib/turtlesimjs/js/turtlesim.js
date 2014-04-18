var TurtleSim = (function() {

  var TurtleSim = function(options) {
    var that = this;
    options = options || {};
    this.ros     = options.ros;
    this.context = options.context;
    this.turtle  = null;

    document.onkeydown = function(event) {
      var keyCode = event.keyCode || event.which;
      var arrow  = { left: 37, up: 38, right: 39, down: 40 };
      if (keyCode === arrow.up) {
        that.turtle.moveForward();
        return false;
      }
      else if (keyCode === arrow.down) {
        that.turtle.moveBackward();
        return false;
      }
      else if (keyCode === arrow.left) {
        that.turtle.moveLeft();
        return false;
      }
      else if (keyCode === arrow.right) {
        that.turtle.moveRight();
        return false;
      }
    };
  };

  TurtleSim.prototype.spawnTurtle = function(name) {
    var that = this;
    var initialPose = {
      x : that.context.canvas.width / 2
    , y : that.context.canvas.height / 2
    };

    that.turtle = new Turtle({
      name    : name
    , ros     : that.ros
    , pose    : initialPose
    , context : that.context
    });
    that.turtle.on('dirty', that.draw.bind(that));
  };

  TurtleSim.prototype.draw = function() {
    this.context.fillStyle = "BLUE"
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.turtle.draw();
  };

  return TurtleSim;
}());

