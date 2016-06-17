var GridGameHelp = new GridGameHelper()

//expects object that responds to .cols and .rows to be parsed
app.directive('ngGameBoard', function(){
  return {
    restrict: 'A',
    require: '^ngModel',
    templateUrl: 'js/grid/gametemplate.html',
    link: function(scope, element, attrs, controller){
      return new GridGameHelp.GameBoard(scope, element, attrs, controller);
    }

  };
});
