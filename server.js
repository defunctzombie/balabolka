
// 3rd party
var express = require('express');
var hbs = require('hbs');
var jsbundler = require('jsbundler');
var stylus = require('stylus');
var Mongolian = require('mongolian');

// globals
var kProduction = process.env === 'production';
var kPubdir = __dirname + '/assets';

// Create a server instance with default host and port
if (process.env.OPENSHIFT_INTERNAL_IP) {
    var mongo_host = process.env.OPENSHIFT_INTERNAL_IP;
    var server = new Mongolian('mongo://admin:lgmtv9RVrh43@' + mongo_host + ':27017');
}
else {
    var server = new Mongolian();
}

var db = server.db('ya');

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
        .import(kPubdir + '/css/mixins/opacity')
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

app.get('/', function(req, res, next) {
    res.render('index');
});

/// domain details
app.get('/domain/:domain_name', function(req, res, next) {
});

/// list all of the chat rooms currently active
app.get('/domains', function(req, res, next) {
    res.render('domains', {
        rooms: rooms
    });
});

// domain -> channel
var rooms = {};

var io = require('socket.io').listen(app);

// intercept global authorization to setup a room for the domain
io.set('authorization', function (handshakeData, cb) {
    cb(null, true); // error first callback style

    // get the domain from the origin header and make a room for it
    var domain = handshakeData.headers.origin;
    domain = domain.replace(/^http(s)?:\/\//, '');
    domain = domain.replace(/:.*/, '');
    handshakeData.domain = domain;

    // no need to make the room again
    if (rooms[domain]) {
        return;
    }

    // create a new room just for the domain
    var room = io.of('/' + domain);
    rooms[domain] = room;

    // this is where we can do per room authorization
    room.authorization(function(data, cb) {
        cb(null, true);
    });

    var count = 0;

    room.on('connection', function(socket) {
        console.log('new connection to main domain room');

        room.emit('count', ++count);

        socket.on('nick', function(data) {
            // TODO change nickname
        });

        socket.on('msg', function(data) {
            var out = {
                msg: data,
                nick: 'TODO',
                timestamp: new Date()
            };

            room.emit('msg', out);

            // set domain
            out.domain = domain;
            messages.insert(out);
        });

        messages.find().limit(5).sort({ timestamp: 1 }).toArray(function (err, array) {
            array.forEach(function(msg) {
                socket.emit('msg', msg);
            });
        });

        socket.on('disconnect', function() {
            room.emit('count', --count);
        });

        // how can the client force certain nicknames?
    });
});

if (require.main === module) {
    app.listen(8000);
}

