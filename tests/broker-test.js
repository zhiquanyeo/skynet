var ControlBroker = require('../netcontrol/controlbroker.js');
var LocalClient = require('../netcontrol/localclient.js');
var mqtt = require('mqtt');

var broker = new ControlBroker();
var lClient = new LocalClient();

var tClient = mqtt.createClient();
var tClient2 = mqtt.createClient();
tClient.publish('skynet/clients/register', 'control');
tClient2.publish('skynet/clients/register', 'control');

console.log("Publishing digitalWrite(1,1) from testClient 1");
tClient.publish('skynet/control/digital/1', '1');

console.log("Publishing analogWrite(2,-1.25) from testClient 1");
tClient.publish('skynet/control/analog/2', '-1.25');

setTimeout(function () {
	console.log("Publishing digitalWrite(2, 0) from testClient 2 (this should not show up");
	tClient2.publish('skynet/control/digital/2', '0');

	console.log("Disconnecting testClient 1");
	tClient.end();

	setTimeout(function() {

		console.log("Publishing digitalWrite(3, 1) from testClient 2");
		tClient2.publish('skynet/control/digital/3', '1');
	}, 2000);
}, 1000);