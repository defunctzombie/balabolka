
var ChatWindow = require('./view/chat_window');

// unique room for domain
var domain = window.location.hostname;

var old_func = io.Transport.prototype.prepareUrl;
io.Transport.prototype.prepareUrl = function() {
    var self = this;
    var options = self.socket.options;
    return self.scheme() + '://localhost:8000/' + options.resource + '/' + io.protocol + '/' + self.name + '/' + self.sessid;
};

console.log(domain);
var room = io.connect('http://localhost:8000/' + domain, {
    host: window.location.hostname,
});

var chat_window = new ChatWindow(room);

// connected
room.on('connect', function() {
    console.log('connected');
});

