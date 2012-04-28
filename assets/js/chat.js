
// TODO chat window init code

// unique room for domain
var domain = window.location.hostname;
var room = io.connect('http://localhost/' + domain);

// connected
room.on('connect', function() {
});

// number of users in the room
room.on('count', function(count) {
    console.log('users: ', count);
});

// new incoming message
room.on('msg', function(details) {
    console.log(details);
});

