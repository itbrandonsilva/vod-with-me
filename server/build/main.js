//var app = require('http').createServer(handler)
//var io = require('socket.io')(app);
//var fs = require('fs');
"use strict";
var http = require('http');
var socketio = require('socket.io');
var shortid = require('shortid');
var Room_1 = require('./Room');
var PORT = 3000;
var rooms = new Map();
var app = http.createServer(function () { });
var io = socketio(app);
io.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    socket.once('join', function (id) {
        socket.removeAllListeners('create');
        console.log(id);
        var room = rooms.get(id);
        if (!room)
            return;
        room.addMember(socket);
    });
    socket.once('create', function () {
        socket.removeAllListeners('join');
        var id = shortid.generate();
        console.log(id);
        rooms.set(id, new Room_1.Room(id, socket));
        socket.emit('id', id);
    });
});
app.listen(PORT, function () {
    console.log("Listening on port " + PORT);
});
