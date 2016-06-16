'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);

    // console.log(io)

    io.on('connection', function(socket) {
        // Now have access to socket, wowzers!
        console.log('connected: ', socket.id)
        socket.emit('anything', { data: 'ok' })

        socket.on('newPlayer', function(data) {
          socket.emit('newPlayer', data)
        })

        socket.on('disconnect', function() {
            console.log('Client disconnected.');
        });

    });

    return io;

};
