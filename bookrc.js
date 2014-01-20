var superstack = require('superstack');
var log = require('book').default();

superstack.async_trace_limit = 5;

//log.use(require('book-git')(__dirname));
//log.use(require('book-raven')(process.env.SENTRY_DSN));

process.on('uncaughtException', function(err) {
    log.panic(err);
    setTimeout(process.exit.bind(process, 1), 5000);
});

module.exports = log;

