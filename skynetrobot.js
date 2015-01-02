//SkynetBot
var Constants = require('./constants.js');

module.exports = function (five) {
	return function() {
		//The main 'class' definition
		function SkynetRobot(config, opts) {
			//Set up the robot properties
			this.driveLayout = Constants.MotorLayout.TWO_WHEEL_DRIVE;
			this.motors = {};
			this.pins = {};

			//State of the pins
			//We need this since johnny-five's read methods are callbacks
			this.pinState = {
				analog: {},
				digital: {}
			}

			this.board = opts.board;

			if (config.motors) {
				//We have motor config
				configureMotors.call(this, config.motors);
			}
			else {
				throw new Error('No motors defined');
			}

			if (config.pins) {
				configurePins.call(this, config.pins);
			}
			//Doesn't matter if we don't have pins

			console.log("this.pinState: ", this.pinState);
		}

		function configureMotors(motorConfig) {
			//We can use 'this' here
			if (motorConfig.layout) {
				this.driveLayout = motorConfig.layout;
			}

			//2WD set up
			if (this.driveLayout === Constants.MotorLayout.TWO_WHEEL_DRIVE) {
				['left', 'right'].forEach(function(motorSide) {
					var motorOpt = motorConfig[motorSide];
					if (motorOpt) {
						if (motorOpt.type === Constants.MotorType.PWM_DIRECTION) {
							if (motorOpt.pwmPin === undefined || motorOpt.directionPin === undefined) {
								throw new Error("Motor (" + motorSide + ") is of type PWM_DIRECTION but is missing one of (pwmPin, directionPin)");
							}

							this.motors[motorSide] = {
								type: motorOpt.type,
								pwmPin: motorOpt.pwmPin,
								directionPin: motorOpt.directionPin
							};

							//Set up the pins
							this.board.pinMode(motorOpt.pwmPin, five.Pin.PWM);
							this.board.pinMode(motorOpt.directionPin, five.Pin.OUTPUT);
						}
						else if (motorOpt.type === Constants.MotorType.SERVO) {
							if (motorOpt.pwmPin === undefined) {
								throw new Error("Motor (" + motorSide + ") is of type SERVO but is missing pwmPin");
							}

							this.motors[motorSide] = {
								type: motorOpt.type,
								pwmPin: motorOpt.pwmPin
							};

							//Set up the pins
							this.board.pinMode(motorOpt.pwmPin, five.Pin.PWM);
						}
					}
					else {
						throw new Error('Missing definition for ' + motorSide + ' motor');
					}
				}, this);
			}
			else {
				//TODO nothing here yet
				console.warn("Nothing implemented for 4WD yet");
			}
		}

		function configurePins(pinConfig) {
			Object.keys(pinConfig).forEach(function(pin) {
				//TODO Check that these pins aren't configured for motors
				var pinType = pinConfig[pin];
				switch (pinType) {
					case Constants.PinTypes.INPUT: {
						this.board.pinMode(pin, five.Pin.INPUT);
						this.pinState.digital[pin] = 0;

						//Set up the listener
						this.board.digitalRead(pin, function(value) {
							this.pinState.digital[pin] = value;
						}.bind(this));
					} break;
					case Constants.PinTypes.INPUT_PULLUP: {
						this.board.pinMode(pin, five.Pin.INPUT);
						this.board.digitalWrite(pin, 1);
						this.pinState.digital[pin] = 0;

						this.board.digitalRead(pin, function(value) {
							this.pinState.digital[pin] = value;
						}.bind(this));
					} break;
					case Constants.PinTypes.OUTPUT: {
						this.board.pinMode(pin, five.Pin.OUTPUT);
						//Output, no need to save state
					} break;
					case Constants.PinTypes.PWM: {
						this.board.pinMode(pin, five.Pin.PWM);
					} break;
					case Constants.PinTypes.SERVO: {
						this.board.pinMode(pin, five.Pin.SERVO);
					} break;
					case Constants.PinTypes.ANALOG: {
						this.board.pinMode(pin, five.Pin.ANALOG);
						this.pinState.analog[pin] = 0; //0-1023

						this.board.analogRead(pin, function(value) {
							this.pinState.analog[pin] = value;
						}.bind(this));
					}
				}
			}, this);
		}

		function clampMotorValues(val) {
			if (val < -1) {
				return -1;
			}
			if (val > 1) {
				return 1;
			}
			return val;
		}

		//Public Exposed methods
		SkynetRobot.prototype.setMotorSpeed = function(motor, speed) {

		};

		return SkynetRobot;
	}();
}