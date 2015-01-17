var mqtt = require('mqtt');
var Constants = require('../constants.js');

function ControlBroker(port) {
	var _controlBroker = this;

	var currentControlClient = null;
	var controlClients = [];

	if (port === undefined) {
		port = Constants.Ports.MQTT_DEFAULT_PORT;
	}

	console.log("[ControlBroker] Starting ControlBroker on port " + port);

	//Create the MQTT server
	mqtt.createServer(function(client) {
		var self = this;

		if (!self.clients) self.clients = {};

		client.on('connect', function(packet) {
			self.clients[packet.clientId] = client;
			client.id = packet.clientId;
			console.log("[ControlBroker] CONNECT: client id: " + client.id);
			client.subscriptions = [];
			client.connack({
				returnCode: 0
			});
		});

		client.on('subscribe', function(packet) {
			var granted = [];

			for (var i = 0; i < packet.subscriptions.length; i++) {
				var qos = packet.subscriptions[i].qos;
				var topic = packet.subscriptions[i].topic;
				var reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

				granted.push(qos);
				client.subscriptions.push(reg);

				//Special case for activeClient messages
				//Broadcast it to the client again
				if (reg.test('skynet/clients/activeClient')) {
					var payload = {
						clientId: currentControlClient,
						queue: controlClients
					};

					sendToClient(client.id, 'skynet/clients/activeClient', JSON.stringify(payload));
				}
			}

			client.suback({
				messageId: packet.messageId,
				granted: granted
			});
		});

		client.on('publish', function(packet) {
			if (packet.topic === 'skynet/clients/register') {
				console.log('[ControlBroker] Registering %s as %s', client.id, packet.payload);
				if (packet.payload === Constants.ClientTypes.CONTROL_CLIENT) {
					if (controlClients.indexOf(client.id) !== -1) {
						console.log("[ControlBroker] %s is already registered");
						return;
					}

					controlClients.push(client.id);
					if (controlClients.length === 1) {
						currentControlClient = client.id;
					}

					var payload = {
						clientId: currentControlClient,
						queue: controlClients
					};

					broadcastToAllClients('skynet/clients/activeClient', JSON.stringify(payload));
				}
			}
			else if (client.id === Constants.ClientIdentifiers.LOCAL_CLIENT) {
				broadcastToAllClients(packet.topic, packet.payload, [Constants.ClientIdentifiers.LOCAL_CLIENT]);
			}
			else if (client.id === currentControlClient) {
				sendToClient(Constants.ClientIdentifiers.LOCAL_CLIENT, packet.topic, packet.payload);
			}
			//Otherwise, we just drop the packet
		});

		client.on('pingreq', function(packet) {
			client.pingresp();
		});

		client.on('disconnect', function(packet) {
			client.stream.end();
		});

		client.on('close', function(packet) {
			delete self.clients[client.id];

			var idx = -1;
			for (var i = 0; i < controlClients.length; i++) {
				if (controlClients[i] === client.id) {
					controlClients.splice(i, 1);
					if (i === 0) {
						if (controlClients.length === 0) {
							currentControlClient = null;
						}
						else {
							currentControlClient = controlClients[0];
						}
					}
					break;
				}
			}

			var payload = {
				clientId: controlClients[0],
				queue: controlClients
			};

			broadcastToAllClients('skynet/clients/activeClient', JSON.stringify(payload));
		});

		client.on('error', function(e) {
			client.stream.end();
		});

		function sendToClient(clientId, topic, payload) {
			var c = self.clients[clientId];
			if (c) {
				for (var i = 0; i < c.subscriptions.length; i++) {
					var s = c.subscriptions[i];

					if (s.test(topic)) {
						c.publish({topic: topic, payload: payload});
						break;
					}
				}
			}
		}

		function broadcastToAllClients(topic, payload, excludes) {
			for (var k in self.clients) {
				if (excludes && excludes.indexOf(k) !== -1) 
					continue;

				sendToClient(k, topic, payload);
			}
		}

	}).listen(port);
};

module.exports = ControlBroker;