var ControlBroker = require('../netcontrol/controlbroker.js');
var LocalClient = require('../netcontrol/localclient.js');
var Constants = require('../constants.js');

var five = require('johnny-five');
var SkynetBot = require('../skynetrobot.js')(five);
var RobotConfigs = require('../robotconfigs.js');


var broker = new ControlBroker();
var localClient = new LocalClient();

//Set up a mock board object
var mockBoard = {
	pinMode: function(pinNum, pinType) {
		var pinTypeString;
		switch(pinType) {
			case five.Pin.INPUT:
				pinTypeString = "INPUT";
				break;
			case five.Pin.OUTPUT:
				pinTypeString = "OUTPUT";
				break;
			case five.Pin.PWM:
				pinTypeString = "PWM";
				break;
			case five.Pin.SERVO:
				pinTypeString = "SERVO";
				break;
			case five.Pin.ANALOG:
				pinTypeString = "ANALOG";
				break;
		}
		console.log("[MockBoard] Configuring pin %s as %s", pinNum, pinTypeString);
	},
	digitalRead: function(pin, callback) {
		//NOP
	},
	analogRead: function(pin, callback) {
		//NOP
	},
	digitalWrite: function(pin, value) {
		console.log("[MockBoard] Writing " + (value ? "HIGH":"LOW") + " to pin %d", pin);
	},
	analogWrite: function(pin, value) {
		console.log("[MockBoard] Writing " + value + " to pin %d", pin);
	}
}

var theRobot = new SkynetBot(RobotConfigs.demoRobotConfig, {
	board: mockBoard
});

localClient.on('pwmSignal', function(data) {
	if (data.port === RobotConfigs.demoRobotConfig.motors.left.pwmPin ||
		data.port === RobotConfigs.demoRobotConfig.motors.right.pwmPin) {
		theRobot.setMotorSpeed(data.port, data.value);
	}
});