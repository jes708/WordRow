'use strict';
var socketio = require('socket.io');
var io = null;
var data = {}

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);

    // console.log(io)

    var onlineplayers = []
    io.on('connection', function(socket) {

        // Now have access to socket, wowzers!
        console.log('A new client has connected!');
        console.log(socket.id);

        var roomName;
        socket.on('joinRoom', function (room) {
          roomName = room;
          socket.join(roomName);
          // if (!data[roomName]) {
          //   data[roomName] = [];
          // } else {
          //   socket.emit('board', data[roomName]);
          // }
          // console.log('above is room sharing data if we decide to save')
          socket.broadcast.to(roomName).emit('justTesting', 'something')
        });

        socket.on('claim', function(spotData){
          socket.broadcast.to(roomName).emit('newBoardData', spotData)
        })

        socket.on('claimEnd', function(spotData){
          socket.broadcast.to(roomName).emit('claimEndC', spotData)
        })

        socket.on('accept', function(){
          socket.broadcast.to(roomName).emit('acceptC')
        })

        socket.on('decline', function(){
          socket.broadcast.to(roomName).emit('declineC')
        })

        socket.on('reqNewGame', function(){
          socket.broadcast.to(roomName).emit('reqNewGameC')
        })

        socket.on('disconnect', function() {
            console.log('A client has disconnected :(');
            console.log(socket.id);
            socket.broadcast.to(roomName).emit('playerDC', 'some data about player')
        });

    });

    return io;

};
