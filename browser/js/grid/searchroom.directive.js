'use strict';

app.directive('roomSearch', function(){
  return {
    restrict: 'E',
    templateUrl: 'js/grid/joinroom.html',
    controller: 'roomsearchCtrl'
  }
})
