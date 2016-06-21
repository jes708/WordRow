app.controller('roomsearchCtrl', function($scope, $state, $location){
  $scope.$state = $state

  $scope.go = function() {
    // location.reload(true)
    // $location.path('/rooms/' + $scope.roomName)
    $state.go('rooms', {roomName: $scope.roomName}, {reload: true})
    $scope.$state = $state
    $scope.roomName = ''
  }
})
