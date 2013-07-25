var events = require('event-component');
var escapehtml = require('../lib/escapehtml');
var classes = require('classes-component');

var tmpl =
'<div class="balabolka-window">' +
    '<div class="balabolka-title"></div>' +
    '<div class="balabolka-body minimize">' +
        '<div class="balabolka-messages"></div>' +
        '<form><input type="text" autocomplete="off"></form>' +
    '</div>' +
'</div>';

var emotimap = {
    ':\\)':'smile',
    ':-\\)':'smile',
    ';\\)':'wink',
    ';-\\)':'wink',
    ':D':'grin',
    ':-D':'grin',
    ':\\(':'sad',
    ':-\\(':'sad',
    ':o':'eek',
    ':-o':'eek',
    '8O':'shock',
    '8-O':'shock',
    '8\\)':'cool',
    '8-\\)':'cool',
    ':x':'mad',
    ':-x':'mad',
    ':P':'razz',
    ':-P':'razz',
    ':p':'razz',
    ':-p':'razz',
    ':\\|':'neutral',
    ':-\\|':'neutral'
};

function ChatWindow(opt) {
    if (!(this instanceof ChatWindow)) {
        return new ChatWindow(opt);
    }

    opt = opt || {};

    var self = this;
    self._opt = {
        show_emoticon: true,
        nick: opt.nick
    };

    self.chat_title_fn = function() {
        return window.location.hostname;
    };

    self.peer_fn = function(count) {
        return ' - ' + count + ' peers';
    };

    if (opt.title !== undefined) {
        self.chat_title_fn = (opt.title instanceof Function) ? opt.title :
            function() { return opt.title };
    }

    if (opt.peers !== undefined) {
        self.peer_fn = opt.peers;
    }

    var div = self._window = document.createElement('div');
    div.innerHTML = tmpl;

    var form = div.querySelector('form');
    var input = form.querySelector('input');
    var body = div.querySelector('.balabolka-body');
    var title = self._title = div.querySelector('.balabolka-title');
    self._messages = div.querySelector('.balabolka-messages');

    events.bind(title, 'click', function(ev) {
        classes(body).toggle('minimize');
    });

    events.bind(form, 'submit', function(ev) {
        ev.preventDefault();
        var msg = input.value;
        input.value = '';

        if (!msg || msg.length === 0) {
            return;
        }

        self.say(msg);
    });

    // hide whole chat window until we have connection
    div.style.display = 'none';

    document.body.appendChild(div);
}

ChatWindow.prototype.send = function(msg) {
    var self = this;
    if (!self.socket) {
        return;
    }
    self.socket.send(JSON.stringify(msg));
}

// send new message
ChatWindow.prototype.say = function(msg) {
    var self = this;

    self.send({
        type: 'msg',
        text: msg
    });
}

ChatWindow.prototype.attach = function(socket) {
    var self = this;

    if (self.socket) {
        self.socket.off('open');
        self.socket.off('message');
        self.socket.off('close');
    }
    self.socket = socket;

    socket.on('open', function() {
        // enable interface
        self._window.style.display = 'block';

        if (self._opt.nick) {
            self.send({
                type: 'nick',
                nick: self._opt.nick
            });
        }
    });

    socket.on('message', function(msg) {
        msg = JSON.parse(msg);

        switch(msg.type) {
        case 'count':
            return self._count(msg);
        case 'msg':
            return self._msg(msg);
        default:
            return;
        }
    });

    socket.on('close', function() {
        // disable interface
        self._window.style.display = 'none';
    });
}

ChatWindow.prototype._count = function(msg) {
    var self = this;
    var chat_title = self.chat_title_fn();
    if (self.peer_fn) {
        chat_title += self.peer_fn(msg.count - 1);
    }

    self._title.innerHTML = chat_title;
}

ChatWindow.prototype._msg = function(msg) {
    var self = this;
    var nick = escapehtml(msg.nick);
    var text = escapehtml(msg.text);

    if (self._opt.show_emoticon) {
        Object.keys(emotimap).forEach(function(emoticon) {
            var smile = emotimap[emoticon];
            var re = new RegExp(emoticon, 'g');
            text = text.replace(re, '<span class="balabolka-emoticon ' + smile + '"></span>');
        });
    }

    var span = document.createElement('span');
    span.className = 'balabolka-message';
    span.innerHTML = '<strong>' + nick + ':</strong> ' + text + '</span>';

    var messages = self._messages;
    messages.appendChild(document.createElement('hr'));
    messages.appendChild(span);

    messages.scrollTop = messages.scrollHeight;
}

module.exports = ChatWindow;
