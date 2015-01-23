//index.js
//Web Interface
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var five = require('johnny-five');
var Constants = require('./constants.js');
var SkynetBot = require('./skynetrobot.js')(five);

var RobotConfigs = require('./robotconfigs.js');

var ControlBroker = require('./netcontrol/controlbroker.js');
var LocalClient = require('./netcontrol/localclient.js');

//=== Set up steps ===
// 1) Start up the command server (MQTT)
var broker = new ControlBroker(Constants.Ports.MQTT_DEFAULT_PORT);

// 2) Start up our local MQTT listener which will listen for commands
//    and act accordingly
var localClient = new LocalClient();

// We don't need to do anything about the local control clients since
// the broker handles them. We can query the broker if we need info


//Set up the app interface
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	console.log('user connected');
});

http.listen(3000, function() {
	console.log("Listening on *:3000");
});


//When a socket connects, we should send current state
//Or, we can just set a timer and send every 250ms

//The board
var board = new five.Board({});

//The robot instance
var theBot;

board.on('ready', function() {
	console.log("--- BOARD READY ---");

	theRobot = new SkynetBot(RobotConfigs.demoRobotConfig, {
		board: this
	});

	theRobot.on('digitalReading', function(data) {
		localClient.updateDigital(data.pin, data.value);
	});

	theRobot.on('analogReading', function(data) {
		localClient.updateAnalog(data.pin, data.value);
	});

	localClient.on('shutdown', function() {
		console.log("!!! E-STOP !!!");
		theRobot.estop();
	});

	localClient.on('pwmSignal', function(data) {
		if (data.port === RobotConfigs.demoRobotConfig.motors.left.pwmPin ||
			data.port === RobotConfigs.demoRobotConfig.motors.right.pwmPin) {
			theRobot.setMotorSpeed(data.port, data.value);
		}
	});

	setInterval(function() {
		io.emit('robotState', {
			pinState: theRobot.pinState
		});
	}, 500);
});