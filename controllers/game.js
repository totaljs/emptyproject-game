exports.install = function() {
	F.route('/{room}/', 'game');
	F.websocket('/{room}/', websocket_room, ['json']);
};

function websocket_room(room) {

	var self = this;
	var refresh;

	self.players = function() {
		var arr = [];
		self.all((player) => arr.push({ id: player.id, name: player.query.name, color: player.query.color, left: player.left, top: player.top, radius: player.radius }));
		return arr;
	};

	// New player
	self.on('open', function(client) {

		// Default coordinates
		client.radius = U.random(10, 30);
		client.left = U.random(600 - (client.radius * 2), 0); // canvas width - radius
		client.top = U.random(400 - (client.radius * 2), 0);  // canvas height - radius

		// Notifies yourself
		client.send({ type: 'player', id: client.id });

		// Notifies all players
		clearTimeout(refresh);
		refresh = setTimeout(() => self.send({ type: 'refresh', players: self.players() }), 300);
	});

	self.on('close', function(client) {
		// Notifies all players
		clearTimeout(refresh);
		refresh = setTimeout(() => self.send({ type: 'refresh', players: self.players() }), 300);
	});

	self.on('message', function(client, message) {

		if (message.type === 'move') {
			client.left = message.left;
			client.top = message.top;
			message.id = client.id;
		}

		// Re-sends the message to all players
		self.send(message);
	});

}