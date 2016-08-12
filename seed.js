var chalk = require('chalk');
var db = require('./server/db');
var User = db.model('user');
var Word = db.model('word');
var fs = require('fs');
var Promise = require('sequelize').Promise;

var seedUsers = function () {

    var users = [
        {
            username: 'Tester',
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            username: 'Jon',
            email: 'jon@jon.com',
            password: 'jon'
        },
        {
            username: 'Jan',
            email: 'jan@jan.com',
            password: 'jan'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);

};


var seedWords = function () {

    var words = fs.readFileSync('./dictionary/twl.txt').toString().split('\n');
    var dictionaryJs = `var app = angular.module('dictionary', []);

    app.factory("DictionaryFactory", function() {

      var DictionaryFactory = {};

      DictionaryFactory.dictionary = ${JSON.stringify(words)};

      return DictionaryFactory;

});`

    fs.writeFile('./dictionary/dictionary.js', dictionaryJs, 'utf8', function(err) {
      if (err) throw err;
      console.log('dictionary seeded')
    })

};

seedWords();

db.sync({ force: true })
    .then(function () {
        return seedUsers();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
