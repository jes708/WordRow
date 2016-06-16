'use strict';
var db = require('./_db');
module.exports = db;

require('./models/user')(db);
require('./models/word')(db);

db.sync();