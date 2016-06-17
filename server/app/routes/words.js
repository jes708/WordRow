'use strict';
var db = require('../../db/_db');
var Word = db.model('word');
var router = require('express').Router();

module.exports = router;

// router.get('/', function(req, res, next) {

//     Word.findAll()
//     .then(function(words) {
//         res.send(words);
//     });

// });

// router.get('/random', function(req, res, next) {

//     Word.findAll()
//     .then(function(words) {
//         res.send(words[Math.floor(Math.random() * words.length)]);
//     });

// });

router.post('/', function(req, res, next) {

    Word.findOne({
      where: req.body
    })
    .then(function(word) {
        res.send(word);
    }).catch(next);

});