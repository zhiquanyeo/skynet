var keypress = require('keypress');
var ControlBroker = require('../netcontrol/controlbroker.js');
var LocalClient = require('../netcontrol/localclient.js');
var mqtt = require('mqtt');

var broker = new ControlBroker();
var lClient = new LocalClient();

//This is ours
var cClient = mqtt.createClient();
cClient.publish('skynet/clients/register', 'control');

keypress(process.stdin);

var testDigitalState = false;
var testPwmValue = 0;

console.log("[TestClient] Press 'a' to toggle state of digital pin");
console.log("[TestClient] Press 'up' or 'down' to adjust PWM value");

process.stdin.on('keypress', function(ch, key) {
	if (key && key.ctrl && key.name==='c') {
		process.exit();
	}
	else if (key) {
		switch(key.name) {
			case 'a': {
				testDigitalState = !testDigitalState;
				cClient.publish('skynet/control/digital/1', testDigitalState ? '1' : '0');
			} break;
			case 'up': {
				testPwmValue = clamp(testPwmValue + 0.1, -1.0, 1.0);
				cClient.publish('skynet/control/pwm/1', testPwmValue.toString());
			} break;
			case 'down': {
				testPwmValue = clamp(testPwmValue - 0.1, -1.0, 1.0);
				cClient.publish('skynet/control/pwm/1', testPwmValue.toString());
			} break;
		}
	}
});

process.stdin.setRawMode(true);
process.stdin.resume();

function clamp(val, min, max) {
	if (val < min)
		return min;
	if (val > max)
		return max;
	return val;
}