
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
    var notify;

    window.append(title).append(body);
    body.append(messages).append(chat_form);
    chat_form.append(msg_input);
    body.hide();

    $('body').append(window);

    window.hide();

    title.text('balabolka');

    title.click(function() {
        body.slideToggle();
        clearInterval(notify);
        notify = null;
        title.removeClass();
        title.addClass('balabolka-title');
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
        var nick = $('<div />').text(details.nick).html();
        var msg = $('<div />').text(details.msg).html();
        
        var emotimap = {
          ':\\)':'smile',
          ';\\)':'wink',
          ':D':'grin',
          ':\\(':'sad',
          ':o':'eek',
          '8O':'shock',
          '8\\)':'cool',
          ':x':'mad',
          ':P':'razz',
          ':\\|':'neutral'
        };
        
        Object.keys(emotimap).forEach(function(emoticon) {
          var smile = emotimap[emoticon];
          var re = new RegExp(emoticon, "g");
          msg = msg.replace(re, '<span class="emoticon ' + smile + '"></span>');
        });

        var span = $('<span><strong>' + nick + ':</strong> ' + msg + '</span>');
        span.addClass('balabolka-message');
        messages.append($('<hr/>')).append(span);
        messages.scrollTop(messages[0].scrollHeight);

        if(notify == undefined && body.is(":hidden")) {
          notify = setInterval(function(){
            title.toggleClass("balabolka-title-blink");
          }, 2000);
        }
    });
};

module.exports = ChatWindow;
