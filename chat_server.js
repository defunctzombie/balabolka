var url = require('url');
var engine = require('engine.io');
var debug = require('debug')('balabolka:chat-server');

var name = require('./name');

// domain -> channel
var rooms = {};

var eio = new engine.Server();

eio.on('connection', function (socket) {
    var req = socket.request;

    var referer = req.headers.referer || req.headers.referrer;
    if (!referer) {
        return socket.close();
    }

    var hostname = url.parse(referer).hostname;

    debug('new connection for hostname: %s', hostname);

    // no need to make the room again
    var sockets = rooms[hostname];
    if (!sockets) {
        sockets = rooms[hostname] = [];
    }

    // generate a random nickname for the user
    var nick = name.random();

    var idx = sockets.push(socket) - 1;

    function send(msg) {
        socket.send(JSON.stringify(msg));
    }

    function send_all(msg) {
        sockets.forEach(function(sock) {
            sock.send(JSON.stringify(msg));
        });
    }

    function update_count() {
        send_all({
            type: 'count',
            count: sockets.length
        });
    }

    update_count();

    socket.on('message', function (msg) {
        msg = JSON.parse(msg);

        if (msg.type === 'nick') {
            nick = msg.nick;
            return;
        }

        if (msg.type !== 'msg') {
            return;
        }

        if (!msg.text) {
            return;
        }

        var out = {
            type: 'msg',
            nick: nick,
            text: msg.text,
            timestamp: new Date()
        };

        send_all(out);

        out.hostname = hostname;
    });

    socket.on('close', function () {
        sockets.splice(idx, 1);
        update_count();
    });
});

module.exports = eio;
