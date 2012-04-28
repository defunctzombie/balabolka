
// host and port for socket.io connection
var host = 'localhost';
var port = 8000;

function main() {
    var ChatWindow = require('./view/chat_window');

    // unique room for domain
    var domain = window.location.hostname;
    var room = io.connect('/' + domain, {
        host: host,
        port: port
    });

    var chat_window = new ChatWindow(room);

    // connected
    room.on('connect', function() {
    });
}

function load_script(url, cb) {
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = url;
    tag.onload = tag.onreadystatechange = cb;
    document.getElementsByTagName('head')[0].appendChild(tag);
}

function check_socketio() {
    if (window.io) {
        return main()
    }
    load_script('//' + host + ':' + port + '/socket.io/socket.io.js', main);
}

// detect if jquery is already available
if (window.jQuery) {
    check_socketio();
}
load_script('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', check_socketio);
