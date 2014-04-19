turtlesimjs
========

### turtlesimJS for ROS with almost identical features of turtlesim

## Examples

[An example](http://feizhan.github.io/turtlesimjs/index.html)

## Usage

Pre-built files can be found in either [turtlesim.js](build/turtlesim.js) or [turtlesim.min.js](build/turtlesim.min.js).

## Installation

In html, add
```
<script src="build/turtlesim.js"></script>
```
and
```
<canvas id="world" width="500" height="500"></canvas>
```

In command line, run roscore
```
roscore
```
, rosbridge
```
roslaunch rosbridge_server rosbridge_websocket.launch
```
, and turtle_teleop_key
```
rosrun turtlesim turtle_teleop_key
```.

Just like running turtlesim, you can use turtle_teleop_key to control turtlesimJS.

## APIs

### Create a turtlesim

```
var turtlesim = new TURTLESIMJS.TurtleSim({
	// a ros instance
	ros			: ros,
	// the context of the HTML canvas
	context		: context,
	// if the turtle can be controlled by keyboard
	keyControl	: true,
	// the background color
	fill		: "#4556FF",
	// the interval to update the turtlesim
	interval	: 100
})
```
Some items can be ignored.

### Create a turtle

```
turtlesim.spawnTurtle({
	// a unique name for the turtle
	name		: 'turtle1',
	// initialize pose
	pose		: {
		x		: width / 2,
		y		: height / 2,
		theta	: 0
	}
	// pen for trajectory
	pen			: {
		color	: "#b3b8ff",
		width	: "3",
		off		: false
	},
	// image for a turtle
	img			: "a random turtle image.png"
})
```
Some items can be ignored.

### Subscribed Topics
```
turtleX/cmd_vel (geometry_msgs/Twist)
```
The linear and angular command velocity for turtleX. The turtle will execute a velocity command for 1 second then time out.

### Published Topics
```
turtleX/pose (turtlesim/Pose)
```
The x, y, theta, linear velocity, and angular velocity of turtleX.

### Services

It mimics the services provided by turtlesim. Unfortunately roslibjs does not provide APIs to create a service, so the following functions do not work.

```
clear
```
Clears the turtlesim background and sets the color to the value of the background parameters.
```
reset
```
Resets the turtlesim to the start configuration and sets the background color to the value of the background.
```
kill
```
Kills a turtle by name.
```
spawn
```
Spawns a turtle at (x, y, theta) and returns the name of the turtle. Also will take name for argument but will fail if a duplicate name.
```
turtleX/set_pen
```
Sets the pen's color (r g b), width (width), and turns the pen on and off (off).
```
turtleX/teleport_absolute
```
Teleports the turtleX to (x, y, theta).
```
turtleX/teleport_relative
```
Teleports the turtleX a linear and angular distance from the turtles current position.

### Parameters
```
/background_b
```
Sets the blue channel of the background color.
```
/background_g
```
Sets the green channel of the background color.
```
/background_r
```
Sets the red channel of the background color.

## Dependencies

turtlesimjs depends on:

[EventEmitter2](https://github.com/hij1nx/EventEmitter2),
[roslibjs](https://github.com/RobotWebTools/roslibjs).

## License

turtlesimjs is released with a BSD license. For full terms and conditions, see the [LICENSE](LICENSE) file.

## Acknowledgement


This project follows the idea of [turtlesimjs](https://github.com/baalexander/turtlesimjs), and it mimics [turtlesim](https://github.com/ros/ros_tutorials).
