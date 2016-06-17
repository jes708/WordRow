'use strict';

var Sequelize = require('sequelize');

module.exports = function(db) {

    db.define('room', {
        room: {
            type: Sequelize.STRING,
            allowNull: false
        },
        player1: {
            type: Sequelize.INTEGER
        },
        player2: {
          type: Sequelize.INTEGER
        }
    });
};
