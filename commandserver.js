//The CommandServer
//This is what will communicate with the interface layers
var mqtt = require('mqtt');
var util = require('util');
var events = require('events');
var Constants = require('./constants.js');

//We have a few types of clients
//

function CommandServer(port) {
	events.EventEmitter.call(this);
	var _commandServer = this;

	if (port === undefined) {
		port = Constants.Ports.MQTT_DEFAULT_PORT;
	}

	console.log("Starting MQTT Broker on port " + port);

	//create the MQTT server
	mqtt.createServer(function(client) {
		var self = this;

		if (!self.clients) self.clients = {};

		//This gets fired when a new client connects via MQTT
		client.on('connect', function(packet) {
			self.clients[packet.clientId] = client;
			client.id = packet.clientId;
			console.log("CONNECT: client id: " + client.id);
			client.subscriptions = [];
			client.connack({
				returnCode: 0
			});
		});

		//This gets fired when a client sets up a subscription
		client.on('subscribe', function(packet) {
			var granted = [];

			console.log("SUBSCRIBE(%s): %j", client.id, packet);

			for (var i = 0; i < packet.subscriptions.length; i++) {
				var qos = packet.subscriptions[i].qos;
				var topic = packet.subscriptions[i].topic;
				var reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

				granted.push(qos);
				client.subscriptions.push(reg);
			}

			client.suback({
				messageId: packet.messageId,
				granted: granted
			});
		});

		//This gets fired when a publish is fired
		client.on('publish', function(packet) {
			console.log("PUBLISH(%s): %j", client.id, packet);
			//We should also check the topic here. If it's
			//the 'registerClient' message, update ourselves
			if (packet.topic === 'registerClient') {
				//TODO: read the payload
				console.log("registerClient: ", packet.payload);
			}

			for (var k in self.clients) {
				var c = self.clients[k];

				for (var i = 0; i < c.subscriptions.length; i++) {
					var s = c.subscriptions[i];

					if (s.test(packet.topic)) {
						c.publish({
							topic: packet.topic,
							payload: packet.payload
						});
						break;
					}
				}
			}
		});

		//Handle ping
		client.on('pingreq', function(packet) {
			client.pingresp();
		});

		//Handle clean disconnect
		client.on('disconnect', function(packet) {
			console.log("DISCONNECT(%s)", client.id);
			client.stream.end();
		});

		//Handle close
		client.on('close', function(packet) {
			delete self.clients[client.id];
		});

		//Error conditions (so we don't crash)
		client.on('error', function(e) {
			//TODO we need to handle the case where the client side dies.
			//we will need to close the stream and delete ourselves
			client.stream.end();
			console.log(e);
		});

	}).listen(port);
}

util.inherits(CommandServer, events.EventEmitter);

module.exports = CommandServer;