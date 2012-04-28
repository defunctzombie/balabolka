
var ChatWindow = require('./view/chat_window');

// unique room for domain
var domain = window.location.hostname;
var room = io.connect('http://localhost/' + domain);

var chat_window = new ChatWindow(room);

// connected
room.on('connect', function() {
});

