'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

  db.define('word', {
    word: {
      type: Sequelize.STRING,
      allowNull: false
    }      
  });


};
