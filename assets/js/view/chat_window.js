
function ChatWindow(room) {
    var window = $('<div>').addClass('balabolka-window');
    var title = $('<div>').addClass('balabolka-title');
    var body = $('<div>').addClass('balabolka-body');
    var messages = $('<div>').addClass('balabolka-messages');
    var msg_input = $('<input>').attr('type', 'text').attr('autocomplete', 'off');
    var chat_form = $('<form>').submit(function() {
        var msg = msg_input.val();

        // skip blank messages
        if (!msg || msg.length === 0) {
            return false;
        }

        msg_input.val('');
        room.emit('msg', msg);

        // don't cause form to submit
        return false;
    });

    window.append(title).append(body);
    body.append(messages).append(chat_form);
    chat_form.append(msg_input);
    body.hide();

    $('body').append(window);

    window.hide();

    title.text('balabolka');

    title.click(function() {
        body.slideToggle(function() {
            if ($(this).css('display') !== 'none') {
                msg_input.focus();
            }
        });
    });

    // number of users in the room
    room.on('count', function(count) {
        title.text('balabolka - ' + count + ' peers');
        window.show();
    });

    room.on('disconnect', function() {
        messages.html('');
    });

    // new incoming message
    room.on('msg', function(details) {
        var nick = details.nick;
        var msg = details.msg;
        var span = $('<span><strong>' + nick + ':</strong> ' + msg + '</span>');
        span.addClass('balabolka-message');
        messages.append($('<hr/>')).append(span);
        messages.scrollTop(messages[0].scrollHeight);
    });
};

module.exports = ChatWindow;

