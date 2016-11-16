//var app = require('http').createServer(handler)
//var io = require('socket.io')(app);
//var fs = require('fs');

import * as http from 'http';
import * as socketio from 'socket.io';
import * as fs from 'fs';
import * as shortid from 'shortid';

import { Room } from './Room';

const PORT = 3000;
const rooms: Map<string, Room> = new Map();

let app = http.createServer(function () {});
let io = socketio(app);


io.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    socket.once('join', id => {
        socket.removeAllListeners('create');
        console.log(id);
        let room = rooms.get(id);
        if ( ! room ) return;
        room.addMember(socket);
    });

    socket.once('create', () => {
        socket.removeAllListeners('join');
        let id = shortid.generate();
        console.log(id);
        rooms.set(id, new Room(id, socket));
        socket.emit('id', id);
    });
});


app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
