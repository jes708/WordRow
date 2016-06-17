app.factory('GameFactory', function() {
  let winningWord = ''
  let stealingWord = ''
  return {
    setWord: function(word) {
      winningWord = word
    },
    getWord: function () {
      return winningWord
    },
    setSteal: function(word) {
      stealingWord = word
    },
    getSteal: function() {
      return stealingWord
    }
  }
})
