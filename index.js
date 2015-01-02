//index.js
var five = require('johnny-five');
var Constants = require('./constants.js');
var SkynetBot = require('./skynetrobot.js')(five);

//Experimental still
var robotConfig = {
	motors: {
		layout: Constants.MotorLayout.TWO_WHEEL_DRIVE,
		left: {
			type: Constants.MotorType.PWM_DIRECTION,
			pwmPin: 5,
			directionPin: 4,
		},
		right: {
			type: Constants.MotorType.PWM_DIRECTION,
			pwmPin: 6,
			directionPin: 7
		}
	}
}

//The board
var board = new five.Board({});

//The robot instance
var theBot;

board.on('ready', function() {
	console.log("--- BOARD READY ---");

	theBot = new SkynetBot(robotConfig, {
		board: this
	});
});