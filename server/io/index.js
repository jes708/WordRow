'use strict';
var socketio = require('socket.io');
var io = null;
var data = {}

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);

    // console.log(io)

    io.on('connection', function(socket) {

        // Now have access to socket, wowzers!
        console.log('A new client has connected!');
        console.log(socket.id);

        let roomName;

        let addData = function(move) {
            if (!data[roomName]) data[roomName] = [];
            data[roomName].push(move)
        }
        socket.on('joinRoom', function(room) {
            roomName = room;
            socket.join(roomName);
            // if (!data[roomName]) {
            //   data[roomName] = [];
            // } else {
            //   socket.emit('board', data[roomName]);
            // }
            // console.log('above is room sharing data if we decide to save')
            io.sockets.in(roomName).emit('roomData', {
                count: io.sockets.adapter.rooms[roomName]
            })
        });

        socket.on('redraw', function(playerNum) {
            data[roomName].push({
                playerNum: playerNum,
                redraw: 1
            })
        })

        socket.on('pot', function(potInfo) {
            if (!data[roomName]) data[roomName] = [];
            data[roomName].push({
                playerNum: potInfo.playerNum,
                pot: potInfo.pot
            })
        })

        socket.on('passedTurn', function() {
            socket.broadcast.to(roomName).emit('passedTurnC')
        })

        socket.on('claim', function(spotData) {
            addData(spotData)
            socket.broadcast.to(roomName).emit('claimC', spotData)
        })

        socket.on('claimEnd', function(spotData) {
            addData(spotData)
            socket.broadcast.to(roomName).emit('claimEndC', spotData)
        })

        socket.on('reqBoardData', function() {
            if (!data[roomName]) data[roomName] = [];
            console.log('player asked for game data')
            console.log(data[roomName])
            socket.emit('boardData', data[roomName])
        })

        socket.on('accept', function() {
            data[roomName] = []
            socket.broadcast.to(roomName).emit('acceptC')
        })

        socket.on('decline', function() {
            socket.broadcast.to(roomName).emit('declineC')
        })

        socket.on('reqNewGame', function() {
            socket.broadcast.to(roomName).emit('reqNewGameC')
        })

        socket.on('selected', function(cell){
          socket.broadcast.to(roomName).emit('selectedC', cell)
        })

        socket.on('disconnect', function() {
            console.log('A client has disconnected :(');
            console.log(socket.id);
            socket.broadcast.to(roomName).emit('playerDC', 'some data about player')
        });

    });

    return io;

};
