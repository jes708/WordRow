'use strict';
var db = require('../../db/_db');
var User = db.model('user');
var router = require('express').Router();

router.get('/auth/me', function(req, res, next) {
  res.send(req.user)
})

module.exports = router;
