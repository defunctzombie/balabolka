var engine = require('engine.io-client');
var ChatWindow = require('./view/chat_window');

var host = 'chat.courseoff.com';
var port = 443;

var chatwindow = ChatWindow(window._balabolka || {});

var socket = new engine.Socket({
    host: host,
    port: port
});

chatwindow.attach(socket);

var recon_timer;

socket.on('open', function() {
    clearInterval(recon_timer);
    recon_timer = undefined;
});

socket.on('close', function() {
    recon_timer = setInterval(function() {
        socket.open();
    }, 5000);
});
