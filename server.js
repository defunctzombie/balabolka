
// builtin
var url = require('url');

// 3rd party
var express = require('express');
var hbs = require('hbs');
var jsbundler = require('jsbundler');
var stylus = require('stylus');
var Mongolian = require('mongolian');
var socketio = require('socket.io');

// locals
var name = require('./name');

// globals
var kProduction = process.env === 'production';
var kPubdir = __dirname + '/assets';

var db = new Mongolian(process.env.MONGODB_CONN_STRING || 'mongodb://localhost/ya');

// previous messages
var messages = db.collection('messages');

var app = express.createServer();

app.register('html', hbs);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout: true,
    cache: kProduction
});

app.use(express.favicon(kPubdir + '/favicon.ico'));

function compile(str, path) {
    return stylus(str)
        .import(kPubdir + '/css/mixins/border-radius')
        .import(kPubdir + '/css/mixins/box-shadow')
        .set('filename', path)
        .set('warn', true)
        .set('compress', true);
}

app.use(stylus.middleware({
    src: kPubdir,
    dest: kPubdir,
    compile: compile,
}));

app.use('/js/chat.js', jsbundler.bundle(kPubdir + '/js/chat.js').middleware());

app.use(express.static(kPubdir));

app.error(function(err, req, res, next) {
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

var io = socketio.listen(app);

io.set('log level', -1);
io.set('browser client etag', true);
io.set('browser client minification', true);

// intercept global authorization to setup a room for the domain
io.set('authorization', function (handshakeData, cb) {
    // get the domain from the origin header and make a room for it
    var referer = handshakeData.headers.referer || handshakeData.headers.referrer;

    // no connection if no referer
    cb(null, !!referer);

    var hostname = url.parse(referer).hostname;

    // no need to make the room again
    if (rooms[hostname]) {
        return;
    }

    // create a new room just for the hostname
    var room = io.of('/' + hostname);
    rooms[hostname] = room;

    var count = 0;
    room.on('connection', function(socket) {

        // generate a random nickname for the user
        var nick = name.random();

        // inform them of how many peers in the chat
        // including themselves
        room.emit('count', ++count);

        socket.on('nick', function(data) {
            nick = data;
        });

        socket.on('msg', function(data) {
            if (!data || data.length === 0) {
                return;
            }

            var out = {
                msg: data,
                nick: nick,
                timestamp: new Date()
            };

            room.emit('msg', out);

            // set hostname
            out.hostname = hostname;
            messages.insert(out);
        });

        messages.find({ hostname: hostname }).sort({ timestamp: -1 }).limit(5).toArray(function (err, array) {
            if (err) {
                return console.error(err);
            }
            else if (!array) {
                return;
            }

            array.reverse();
            array.forEach(function(msg) {
                socket.emit('msg', msg);
            });
        });

        socket.on('disconnect', function() {
            room.emit('count', --count);
        });
    });
});

var NotFound = function(msg) {
    Error.call(this);
    this.name = 'NotFound';
    this.status = 404;
    this.message = msg;
};

if (require.main === module) {
    app.listen(8000);
}

