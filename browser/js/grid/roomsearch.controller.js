app.controller('roomsearchCtrl', function($scope, $state, $location){
  $scope.$state = $state

  $scope.go = function() {
    $state.go('rooms', {roomName: $scope.roomName}, {reload: true})
    $scope.$state = $state
    $scope.roomName = ''
  }
})
