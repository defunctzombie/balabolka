
function ChatWindow(room) {
    var chat_window = $('<div>').addClass('balabolka-window');
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
    var notify;

    chat_window.append(title).append(body);
    body.append(messages).append(chat_form);
    chat_form.append(msg_input);
    body.hide();

    $('body').append(chat_window);

    chat_window.hide();

    title.click(function() {
        body.slideToggle();
        clearInterval(notify);
        notify = null;
        title.removeClass();
        title.addClass('balabolka-title');
    });

    // number of users in the room
    room.on('count', function(count) {
        title.text(window.location.hostname + ' chat - ' + count + ' peers');
        chat_window.show();
    });

    room.on('disconnect', function() {
        messages.html('');
    });

    // new incoming message
    room.on('msg', function(details) {
        var nick = $('<div />').text(details.nick).html();
        var msg = $('<div />').text(details.msg).html();

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
          '8\\)':'cool',
          '8-\\)':'cool',
          ':x':'mad',
          ':-x':'mad',
          ':P':'razz',
          ':-P':'razz',
          ':p':'razz',
          ':\\|':'neutral'
        };

        Object.keys(emotimap).forEach(function(emoticon) {
          var smile = emotimap[emoticon];
          var re = new RegExp(emoticon, 'g');
          msg = msg.replace(re, '<span class="balabolka-emoticon ' + smile + '"></span>');
        });

        var span = $('<span><strong>' + nick + ':</strong> ' + msg + '</span>');
        span.addClass('balabolka-message');
        messages.append($('<hr/>')).append(span);
        messages.scrollTop(messages[0].scrollHeight);

        if(notify == undefined && body.is(":hidden")) {
          notify = setInterval(function(){
            title.toggleClass("balabolka-title-alert");
          }, 1500);
        }
    });
};

module.exports = ChatWindow;
