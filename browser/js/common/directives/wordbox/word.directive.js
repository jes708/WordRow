app.directive('wordbox', function(WordFactory, GameFactory){
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/wordbox/word.html',
    scope: 'true'
  };
});
