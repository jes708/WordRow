'use strict';
var db = require('../../db/_db');
var Word = db.model('word');
var router = require('express').Router();

module.exports = router;

router.get('/random', function(req, res, next) {

    Word.findAll()
    .then(function(words) {
        res.send(words[Math.floor(Math.random() * words.length)])
    })

})
