var express = require('express');
var hbs = require('hbs');
var enchilada = require('enchilada');
var makeover = require('makeover');
var stylish = require('stylish');
var debug = require('debug')('balabolka:www');
var envify = require('envify');
var log = require('bookrc');

var kProduction = process.env.NODE_ENV === 'production';
var kPubdir = __dirname + '/assets';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    cache: kProduction
});
app.engine('html', hbs.__express);

app.use(express.favicon(kPubdir + '/favicon.ico'));

app.use(function(req, res, next) {
    process.env.BALABOLKA_HOST = req.headers.host;
    next();
});

app.use(enchilada({
    src: kPubdir,
    compress: kProduction,
    cache: kProduction,
    debug: true,
    transforms: [envify]
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
        log.error(err, req);
    }

    res.send(err.message, status);
});

// our routes

app.get('/', function(req, res, next) {
    res.locals.hostname = req.headers.host;
    res.render('index');
});

module.exports = app;
