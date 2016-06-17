'use strict';
var db = require('../../db/_db');
var Word = db.model('word');
var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res, next) {

    Word.findOne({
      where: req.body
    })
    .then(function(word) {
        res.send(word);
    }).catch(next);

});
