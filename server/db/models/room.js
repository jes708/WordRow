'use strict';

var Sequelize = require('sequelize');

module.exports = function(db) {

    db.define('room', {
        room: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
};
