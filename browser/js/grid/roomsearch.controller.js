app.controller('roomsearchCtrl', function($scope, $state, $location){
  $scope.$state = $state

  $scope.go = function() {
    location.reload(true)
    $location.path('/rooms/' + $scope.roomName)
    $scope.$state = $state
    $scope.roomName = ''
  }
})
