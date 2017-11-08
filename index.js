var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = [];
var connections = [];
var allMsgs = [];

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected! There are now %d sockets connected.', connections.length);

    // New User
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        console.log(socket.username + ' just logged in!');
        updateUsernames();
        updateMsgs();
    });

    // User Typing
    socket.on('user typing', function(){
        socket.broadcast.emit('show typing', socket.username);
    });

    // Stop Typing
    socket.on('stop typing', function(){
        io.emit('no typing');
    });

    // Send Message
    socket.on('send message', function (data) {
        var msgTime = new Date();
        var msgOb = {
            msg: data,
            user: socket.username,
            hour: msgTime.getHours(),
            min: msgTime.getMinutes(),
            sec: msgTime.getSeconds(),
            toString: function() {
                return this.hour + ':' + this.min + ':' + this.sec + '-' + this.user + '-' + this.msg;
            }
        };
        allMsgs.push(msgOb);
        updateMsgs();
        console.log(allMsgs.toString());
    });

    // Disconnect
    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log(socket.username + ' just logged out!');
        console.log('There are now %d sockets connected.', connections.length);
    });

    function updateUsernames() {
        io.emit('get users', users);
    };

    function updateMsgs() {
        io.emit('new message', allMsgs);
    };
});

http.listen(3000, function () {
    console.log('Listening on *:3000');
});
