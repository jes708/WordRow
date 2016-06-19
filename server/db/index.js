'use strict';
var db = require('./_db');
module.exports = db;

require('./models/user')(db);
require('./models/word')(db);
require('./models/room')(db);

// Room.belongsTo(User, {as: 'player1'});
// Room.belongsTo(User, {as: 'player2'});

db.model('room').belongsTo(db.model('user'), {as: 'player1'});
db.model('room').belongsTo(db.model('user'), {as: 'player2'});

db.sync();
