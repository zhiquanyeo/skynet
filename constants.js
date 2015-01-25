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

var Ports = {
	MQTT_DEFAULT_PORT: 1883
}

var ClientTypes = {
	CONTROL_CLIENT: 'control',
	LOCAL_CLIENT: 'local'
}

var ClientIdentifiers = {
	LOCAL_CLIENT: 'SkynetLocalClient'
}

var TimeDelays = {
	DIGITAL_SENSOR_UPDATE_DELAY: 50, //ms
	ANALOG_SENSOR_UPDATE_DELAY: 10
}

module.exports = {
	PinTypes: PinTypes,
	MotorLayout: MotorLayout,
	MotorType: MotorType,
	Ports: Ports,
	ClientTypes: ClientTypes,
	ClientIdentifiers: ClientIdentifiers,
	TimeDelays: TimeDelays
};