app.directive('wordbox', function(WordFactory, GameFactory){
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/wordbox/word.html',
    scope: 'true',
    link: function(scope) {
        scope.verify = function(pot, word) {
        if (scope.gameStatus) return;
        if (!scope.yourTurn) return;
        let steal = GameFactory.getSteal();
        if (WordFactory.verify(pot, word, steal)) {

          if (WordFactory.submitWord(word)) {
            WordFactory.endTurn(pot, word, steal);
            WordFactory.createPot(pot);
            scope.word = '';
            GameFactory.setWord(word)
            scope.claimCell();
          } else {
            scope.message = "Invalid word";
          }

        } else {
          scope.message = "Invalid letters";
        }
      };
    }
  };
});
