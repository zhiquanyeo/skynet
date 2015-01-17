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

	//Register ourselves
	this.client.publish('skynet/clients/register', Constants.ClientTypes.LOCAL_CLIENT);

	this.client.on('message', function(topic, message) {
		var controlMessageResult = controlRegex.exec(topic);
		if (controlMessageResult !== null) {
			console.log("[LocalClient] Received a message about %s channel %s: %s", controlMessageResult[1], controlMessageResult[2], message);
		}
	});
}

util.inherits(LocalClient, events.EventEmitter);

module.exports = LocalClient;