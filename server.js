
// 3rd party
var express = require('express');
var hbs = require('hbs');
var jsbundler = require('jsbundler');

var app = express.createServer();

var kProduction = process.env === 'production';
var kPubdir = __dirname + '/assets';

app.register('html', hbs);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout: true,
});

if (kProduction) {
    app.set('view options', { cache: true });
}

app.use(express.favicon(kPubdir + '/favicon.ico'));

app.use('/js/chat.js', jsbundler.bundle(kPubdir + '/js/chat.js').middleware());

app.use(express.static(kPubdir));

app.get('/', function(req, res, next) {
    res.render('index');
});

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

if (require.main === module) {
    app.listen(8000);
}

