app.controller('roomsearchCtrl', function($scope, $state, $location){
  $scope.$state = $state
  $scope.go = function() {
    // $state.go('rooms', {roomName: $scope.roomName})
    $location.path('/rooms/' + $scope.roomName)
    $scope.$state = $state
    $scope.roomName = ''
  }
})
