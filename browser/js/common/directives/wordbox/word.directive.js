app.directive('wordbox', function(WordFactory, GameFactory){
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/wordbox/word.html',
    scope: {
      claimcell: '&',
      selectedcell: '=',
      winningword: '='
    },
    link: function(scope) {
      console.log('loaded')
      scope.submit = WordFactory.submitWord;

      scope.pot = [];

      scope.createPot = WordFactory.createPot

      scope.verify = function(pot, word) {
        let steal = GameFactory.getSteal()
        if (WordFactory.verify(pot, word, steal)) {

          WordFactory.submitWord(word)
          .then(function(wordRes) {
            if (wordRes.data) {
              console.log('word res: ', wordRes.data.word)
              WordFactory.endTurn(pot, word, steal);
              WordFactory.createPot(pot);
              GameFactory.setWord(wordRes.data.word)
              scope.claimcell();
            } else {
              scope.message = "Invalid word";
            }
          });

        } else {
          scope.message = "Invalid letters";
        }
      };
    }
  }
})
