app.config(function ($stateProvider) {
    $stateProvider.state('word', {
        url: '/word',
        templateUrl: 'js/word/word.html',
        controller: 'WordCtrl'
    });
});

app.factory('WordFactory', function ($http, DictionaryFactory) {

  var WordFactory = {};

  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var vowels = 'aeiou';
  var consonants = 'bcdfghjklmnpqrstvwxyz';
  var common = "bnmasdfghlertiop";
  var commonVowels = "aeio";
  var commonConsonants = "bnmsdfghlrtp";

  function randLetter() {
    return alphabet[Math.floor(Math.random() * 26)]
  }

  function randVowel() {
    return vowels[Math.floor(Math.random() * 5)]
  }

  function randConsonant() {
    return consonants[Math.floor(Math.random() * 21)]
  }

  function commonLetter() {
    return common[Math.floor(Math.random() * 16)]
  }

  function commonVowel() {
    return commonVowels[Math.floor(Math.random() * 4)]
  }

  function commonConsonant() {
    return commonConsonants[Math.floor(Math.random() * 12)]
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
    if (DictionaryFactory.dictionary.indexOf(word) !== -1) return word;
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
  };

  WordFactory.shuffle = function(pot) {
    var newPot = [], i;
    while (pot.length) {
      i = Math.floor(Math.random() * pot.length);
      newPot.push(pot.splice(i, 1)[0])
    }
    return newPot;
  }

  WordFactory.verify = function(pot, word, steal) {
    var stealCopy = steal || "";
    if (word.length <= stealCopy.length) return false;
    var potCopy = pot.slice();
    var wordCopy = word;
    var stealLetters = stealCopy.split("").sort();
    var validLetters = (stealLetters.concat(potCopy)).sort();
    var sortedWord = wordCopy.split("").sort();
    var i = 0;
    var j = 0;

    while (i < sortedWord.length) {
      if (stealLetters[0] === sortedWord[i]) {
        stealLetters.shift();
      }
      i++
    }

    if (stealLetters.join().length) return false;

    i = 0;
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

    var stealCopy = steal || "";
    var wordCopy = word;
    var wordLetters = wordCopy.split("").sort();
    var stealLetters = stealCopy.split("").sort();
    var i = 0;

    while (stealLetters.length) {
      if (stealLetters[0] === wordLetters[i]) {
        stealLetters.shift();
        wordLetters.splice(i, 1);
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
