var url = require('url');

var express = require('express');
var hbs = require('hbs');
var enchilada = require('enchilada');
var Mongolian = require('mongolian');
var makeover = require('makeover');
var stylish = require('stylish');
var engine = require('engine.io');
var debug = require('debug')('balabolka');

var name = require('./name');

var kProduction = process.env.NODE_ENV === 'production';
var kPubdir = __dirname + '/assets';

var db = new Mongolian(process.env.MONGODB_CONN_STRING || 'mongodb://localhost/balabolka');

// previous messages
var messages = db.collection('messages');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    cache: kProduction
});
app.engine('html', hbs.__express);

app.use(express.favicon(kPubdir + '/favicon.ico'));

app.use('/js/chat.js', function(req, res, next) {
    res.header('cache-control', 'public, max-age: 60');
    next();
});

app.use(enchilada({
    src: kPubdir,
    compress: kProduction,
    cache: kProduction
}));

app.use(stylish({
    src: kPubdir,
    cache: kProduction,
    compress: kProduction,
    setup: function(renderer) {
        return renderer.use(makeover())
    }
}));

app.use(express.static(kPubdir));

app.use(app.router);

app.use(function(err, req, res, next) {
    var status = err.status || 500;

    if (status >= 500) {
        console.error(err.stack);
    }

    res.send(err.message, status);
});

app.get('/', function(req, res, next) {
    res.render('index');
});

/// domain details
app.get('/domain/:domain_name', function(req, res, next) {
    var domain = req.param('domain_name');

    var room = rooms[domain];
    if (!room) {
        return next(new NotFound());
    }

    res.render('domain');
});

/// list all of the chat rooms currently active
app.get('/rooms', function(req, res, next) {
    res.render('rooms', {
        rooms: Object.keys(rooms)
    });
});

// domain -> channel
var rooms = {};

var server = app.listen(8080);
var eio = engine.attach(server);

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
        messages.insert(out);
    });

    socket.on('close', function () {
        sockets.splice(idx, 1);
        update_count();
    });

    messages.find({ hostname: hostname }).sort({ timestamp: -1 }).limit(5).toArray(function (err, array) {
        if (err) {
            return console.error(err);
        }
        else if (!array) {
            return;
        }

        array.reverse().forEach(function(msg) {
            send({
                type: 'msg',
                nick: msg.nick,
                text: msg.text
            });
        });
    });
});
