'use strict';
var db = require('./_db');
module.exports = db;

require('./models/user')(db);
require('./models/word')(db);
require('./models/room')(db);

db.sync();
