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

  $scope.verify = function(pot, word, steal) {
    if (WordFactory.verify(pot, word, steal)) {

      WordFactory.submitWord(word)
      .then(function(response) {
        if (response.data) {
          WordFactory.endTurn(pot, word, steal);
          WordFactory.createPot(pot);
        } else {
          $scope.message = "Invalid word";
        }
      });

    } else {
      $scope.message = "Invalid letters";
    }
  };

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
    return $http.post('/api/words/', {word: word});
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
    var stealCopy = steal || "";
    var potCopy = pot.slice();
    var wordCopy = word;

    var validLetters = (stealCopy.split("") + potCopy.sort());
    var sortedWord = wordCopy.split("").sort();
    var i = 0;
    var j = 0;

    while (i < validLetters.length && j < sortedWord.length) {
      if (validLetters[i] === sortedWord[j]) {
        j++
        if (j >= sortedWord.length ) {
          return true;
        }
      }
      i++
    }
    return false
  };

  WordFactory.endTurn = function(pot, word, steal) {
    //remove used letters from pot
    var stealCopy = steal || "";
    // var potCopy = pot.slice();
    var wordCopy = word;
    console.log(word)
    var wordLetters = wordCopy.split("").sort();
    // var potLetters = potCopy.sort();
    var stealLetters = stealCopy.split("").sort();
    var i = 0;

    while (stealLetters.length) {
      if (stealLetters[0] === wordLetters[i]) {
        stealLetters.shift();
        wordLetters.shift();
      } else {
        i++
      }
    }

    while (wordLetters.length) {
      pot.splice(pot.indexOf(wordLetters.shift()),1);
    }

  };

  return WordFactory;

});