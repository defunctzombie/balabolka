
// 3rd party
var express = require('express');
var hbs = require('hbs');

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
app.use(express.static(kPubdir));

app.get('/', function(req, res, next) {
    res.render('index');
});

if (require.main === module) {
    app.listen(8000);
}

