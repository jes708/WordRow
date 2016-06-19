'use strict';
var db = require('../../db/_db');
var Room = db.model('room');
var router = require('express').Router();

module.exports = router;

router.get('/:roomName', function(req, res, next) {
    Room.findOrCreate({
        where: {
            room: req.params.roomName
        }
    })
    .then(function(room) {
        room = room[0]
        res.send(room)
    })
    .catch(next)
})

router.post('/', function(req, res, next) {
    //req.user.id
    if (req.user) {
        // if (req.body.room === '/') {
        //     req.body.room = 'root'
        // } else {
        //    req.body.room = req.body.room.match(/\/(\d*\w*)\/?/i)[1]
        // }
        return Room.findOrCreate({
                where: req.body
            })
            .then(function(room) {
                room = room[0]
                console.log("asdfghjklzxcvbnm", room)
                if (!room.player1Id || room.player1Id === req.user.id) {
                    console.log("PLayer1ID")
                    return room.update({
                        player1Id: req.user.id
                    }).then(something => 'Player 1')
                } else if (!room.player2Id || room.player2Id === req.user.id) {
                    console.log("PLayer2ID")
                    return room.update({
                        player2Id: req.user.id
                    }).then(somethingelse => 'Player 2')
                } else {
                    console.log("resolve")
                    return new Promise(resolve => resolve('room is full'))
                }
            }).then(function(room) {
                res.send(room)
            })
    }
})
