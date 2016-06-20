'use strict';
var db = require('../../db/_db');
var Room = db.model('room');
var User = db.model('user');
var router = require('express').Router();

module.exports = router;

router.get('/:roomName', function(req, res, next) {
    Room.findOrCreate({
        where: {
            room: req.params.roomName
        }, 
        include: [
          {
            model: User,
            as: 'player1',
            attributes: ['username']
          },
          {
            model: User,
            as: 'player2',
            attributes: ['username']
          }
        ]
    })
    .then(function(room) {
        room = room[0]
        res.send(room)
    })
    .catch(next)
})

router.post('/', function(req, res, next) {
    if (req.user) {
        return Room.findOrCreate({
                where: req.body
            })
            .then(function(room) {
                room = room[0]
                if (!room.player1Id || room.player1Id === req.user.id) {
                    return room.update({
                        player1Id: req.user.id
                    }).then(something => 'Player 1')
                } else if (!room.player2Id || room.player2Id === req.user.id) {
                    return room.update({
                        player2Id: req.user.id
                    }).then(somethingelse => 'Player 2')
                } else {
                    return new Promise(resolve => resolve('room is full'))
                }
            }).then(function(room) {
                res.send(room)
            })
    }
})
