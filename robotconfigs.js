var Constants = require('./constants.js');
var demoRobotConfig = {
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
	},
	pins: [
		{
			pinNumber: 0,
			type: Constants.PinTypes.ANALOG
		},
		{
			pinNumber: 2,
			type: Constants.PinTypes.INPUT_PULLUP
		},
		{
			pinNumber: 3,
			type: Constants.PinTypes.INPUT_PULLUP
		}
	]
};

module.exports = {
	demoRobotConfig: demoRobotConfig
}