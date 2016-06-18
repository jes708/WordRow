/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

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
            username: 'ObamaRulez',
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);

};


var seedWords = function () {

    //var words = fs.readFileSync('./dictionary/1-1000.txt').toString().split('\n');
    var words = fs.readFileSync('./dictionary/twl.txt').toString().split('\n');
    // words = words.filter(function(word) {
    //     return word.length > 3;
    // })

    words = words.map(function(word) {
        return {word: word};
    });

    var creatingWords = words.map(function (wordObj) {
        return Word.create(wordObj);
    });

    return Promise.all(creatingWords);

};

db.sync({ force: true })
    .then(function () {
        return seedUsers();
    })
    .then(function () {
        return seedWords();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
