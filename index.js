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

var CommandServer = require('./commandserver.js');
var LocalClient = require('./localclient.js');

//=== Set up steps ===
// 1) Start up the command server (MQTT)
var commandServer = new CommandServer(Constants.Ports.MQTT_DEFAULT_PORT);

// 2) Start up our local MQTT listener which will listen for commands
//    and act accordingly
var mqttClient = new LocalClient();

// 3) Set up the list of control clients
//	  This will be a queue and get spliced as people drop out
//	  This will allow multiple control clients to connect
var controlClients = [];
var currentControlClient = null;



mqttClient.on('newClient', function(clientInfo) {
	//clientId and clientType
	if (clientInfo.clientType === Constants.ClientTypes.CONTROL_CLIENT) {
		//Only add control clients
		if (!clientExists(clientInfo.clientId)) {
			controlClients.push(clientInfo);
			if (controlClients.length === 1) {
				currentControlClient = clientInfo;
				console.log("Updating Control Client");
				mqttClient.updateControlClient(currentControlClient);
			}
		}
	}
});

mqttClient.on('droppedClient', function(clientId) {
	var cIndex = clientIndex(clientId);
	if (cIndex !== -1) {
		if (cIndex === 0) {
			controlClients.splice(0, 1);
			if (controlClients.length > 0) {
				//notify the next client that they have control
				//TODO Send a broadcast informing all control clients
				//about who is next
				currentControlClient = controlClients[0];
				mqttClient.updateControlClient(currentControlClient);
			}
			else {
				currentControlClient = null;
			}
		}
	}
	else {
		console.warn("Trying to remove an unregistered client");
	}
});

function clientIndex(clientId) {
	for (var i = 0; i < controlClients.length; i++) {
		if (controlClients[i].clientId === clientId) {
			return i;
		}
	}
	return -1;
}

function clientExists(clientId) {
	return clientIndex(clientId) !== -1;
}

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

	theBot = new SkynetBot(RobotConfigs.demoRobotConfig, {
		board: this
	});

	setInterval(function() {
		io.emit('robotState', {
			pinState: theBot.pinState
		});
	}, 500);
	console.log(theBot.pinState);
});