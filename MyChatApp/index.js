var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/webapp'));

var numOfUsers = 0;
io.on('connection', function(socket) {
    var newuseradded = false;
    socket.on('new message', function(data) {
        socket.broadcast.emit('new message', {
            chatname: socket.chatname,
            message: data
        });
    });

    socket.on('new user', function(chatname) {
        if (newuseradded) return;

        socket.chatname = chatname;
        ++numOfUsers;
        newuseradded = true;
        socket.emit('login', {
            numOfUsers: numOfUsers
        });
        socket.broadcast.emit('user joined', {
            chatname: socket.chatname,
            numOfUsers: numOfUsers
        });
    });

    socket.on('disconnect', function() {
        if (newuseradded) {
            --numOfUsers;
            socket.broadcast.emit('user left', {
                chatname: socket.chatname,
                numOfUsers: numOfUsers
            });
        }
    });
});