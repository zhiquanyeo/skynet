var mqtt = require('mqtt');
var util = require('util');
var events = require('events');
var Constants = require('../constants.js');

function LocalClient() {
	events.EventEmitter.call(this);
	var self = this;

	this.client = mqtt.createClient(Constants.Ports.MQTT_DEFAULT_PORT, {
		clientId: Constants.ClientIdentifiers.LOCAL_CLIENT
	});

	var controlRegex = /skynet\/control\/(.+)\/([0-9]+)$/;

	this.client.subscribe('skynet/control/#');
	this.client.subscribe('skynet/clients/activeClient');
	this.client.subscribe('skynet/clients/shutdown');

	//Register ourselves
	this.client.publish('skynet/clients/register', Constants.ClientTypes.LOCAL_CLIENT);

	this.client.on('message', function(topic, message) {
		if (topic === 'skynet/clients/shutdown') {
			this.emit('shutdown');
			return;
		}
		
		var controlMessageResult = controlRegex.exec(topic);
		if (controlMessageResult !== null) {
			//console.log("[LocalClient] Received a message about %s channel %s: %s", controlMessageResult[1], controlMessageResult[2], message);
		
			switch (controlMessageResult[1]) {
				case 'analog': {
					//console.log("[LC] Emitting analogSignal");
					self.emit('analogSignal', {
						port: parseInt(controlMessageResult[2], 10),
						value: parseFloat(message)
					});
				} break;
				case 'digital': {
					//console.log("[LC] Emitting digitalSignal");
					self.emit('digitalSignal', {
						port: parseInt(controlMessageResult[2], 10),
						value: (message === 'true' || message === '1')
					});
				} break;
				case 'pwm': {
					//console.log("[LC] Emitting pwmSignal");
					self.emit('pwmSignal', {
						port: parseInt(controlMessageResult[2], 10),
						value: parseFloat(message)
					});
				} break;
			}
		}
	});
}

util.inherits(LocalClient, events.EventEmitter);

LocalClient.prototype.updateDigital = function(pin, value) {
	this.client.publish('skynet/sensors/digital/' + pin, value ? "1" : "0");
};

LocalClient.prototype.updateAnalog = function(pin, value) {
	this.client.publish('skynet/sensors/analog/' + pin, value.toString());
};

module.exports = LocalClient;