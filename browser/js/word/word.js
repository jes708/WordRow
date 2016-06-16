app.config(function ($stateProvider) {
    $stateProvider.state('word', {
        url: '/word',
        templateUrl: 'js/word/word.html',
        controller: 'WordCtrl'
    });
});

app.controller('WordCtrl', function ($scope, WordFactory) {

  $scope.submit = WordFactory.submitWord;

  $scope.pot = [];

  $scope.createPot = WordFactory.createPot

  $scope.verify = WordFactory.verify;

});

app.factory('WordFactory', function ($http) {

  var WordFactory = {};

  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var vowels = 'aeiou';
  var consonants = 'bcdfghjklmnpqrstvwxyz';
  var common = "cbnmasdfghlertiop";
  var commonVowels = "aeio";
  var commonConsonants = "cbnmsdfghlrtp";

  function randLetter() {
    console.log('randLetter')
    return alphabet[Math.floor(Math.random() * 26)]
  }

  function randVowel() {
    console.log('randVowel')
    return vowels[Math.floor(Math.random() * 5)]
  }

  function randConsonant() {
    console.log('randConsonant')
    return consonants[Math.floor(Math.random() * 21)]
  }

  function commonLetter() {
    console.log('commonLetter')
    return common[Math.floor(Math.random() * 17)]
  }

  function commonVowel() {
    console.log('commonVowel')
    return commonVowels[Math.floor(Math.random() * 4)]
  }

  function commonConsonant() {
    console.log('commonConsonant')
    return commonConsonants[Math.floor(Math.random() * 13)]
  }

  function vowelCount(pot) {
    return pot.filter(letter => vowels.indexOf(letter) !== -1).length;
  }

  function consonantCount(pot) {
    return pot.filter(letter => vowels.indexOf(letter) === -1).length;
  }

  function uncommonCount(pot) {
    return pot.filter(letter => common.indexOf(letter) === -1).length;
  }

  WordFactory.submitWord = function(word) {
    return $http.post('/api/words/', word);
  };

  WordFactory.createPot = function(pot) {
    var letter;

    while (pot.length < 6) {
      if (uncommonCount(pot) >= 2) {
        if (vowelCount(pot) < 2) pot.push(commonVowel());
        else if (consonantCount(pot) < 2) pot.push(commonConsonant());
        else pot.push(commonLetter());
      } else {
        if (vowelCount(pot) < 2) pot.push(randVowel());
        else if (consonantCount(pot) < 2) pot.push(randConsonant());
        else pot.push(randLetter());
      }
    }
    // $scope.pot = pot;
  };
  
  WordFactory.verify = function(pot, word, steal) {
    steal = steal || "";
    var potCopy = pot.slice();

    var validLetters = (steal.split("") + potCopy.sort());
    var sortedWord = word.split("").sort();
    var i = 0;
    var j = 0;

    while (i < validLetters.length && j < sortedWord.length) {
      if (validLetters[i] === sortedWord[j]) {
        j++
        if (j >= sortedWord.length ) {
          console.log('yes')
          return true;
        }
      }
      i++
    }
    console.log('no')
    return false
  };


  return WordFactory;

});

//aerdpo //keep a, discard erdpo

//roped  //does it contain all five of these letters?

//ajilbe //isInPot?

//period

//scrabble dictionary in db

//a pot of letters that always has 6 letters, and at least two consonants or two vowels

//click on spaces

//check if letters are from pot

//check if words are legal

//check if anagrams are longer than previous entry, contain letter from pot, and are legal

//check if five in a row are all same color