var engine = require('engine.io-client');
var ChatWindow = require('./view/chat_window');

var host = process.env.BALABOLKA_HOST;

var socket = new engine.Socket('ws://' + host);

var chatwindow = ChatWindow(window._balabolka || {});
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
