'use strict';
var db = require('../../db/_db');
var Room = db.model('room');
var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res, next) {
    //req.user.id
    if (req.user) {
        if (req.body.room === '/') {
            req.body.room = 'root'
        } else {
           req.body.room = req.body.room.match(/\/(\d*\w*)\/?/i)[1]
        }
        //need more logic for regex
        return Room.findOrCreate({
                where: req.body
            })
            .then(function(room) {
                room = room[0]
                if (!room.player1 || room.player1 === req.user.id) {
                    return room.update({
                        player1: req.user.id
                    }).then(something => 'Player 1')
                } else if (!room.player2 || room.player2 === req.user.id) {
                    return room.update({
                        player2: req.user.id
                    }).then(somethingelse => 'Player 2')
                } else {
                    return new Promise(resolve => resolve('room is full'))
                }
            }).then(function(room) {
                res.send(room)
            })
    }
})
