//Constants
var PinTypes = {
	INPUT: 1,
	INPUT_PULLUP: 2,
	OUTPUT: 3,
	PWM: 4,
	SERVO: 5,
	ANALOG: 6, //Analog input
};

var MotorLayout = {
	TWO_WHEEL_DRIVE: '2WD',
	FOUR_WHEEL_DRIVE: '4WD'
};

var MotorType = {
	PWM_DIRECTION: 1,
	SERVO: 2
};

module.exports = {
	PinDirections: PinDirections,
	MotorLayout: MotorLayout,
	MotorType: MotorType
};