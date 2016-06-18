app.controller('roomsearchCtrl', function($scope, $state){
  $scope.$state = $state
  $scope.go = function() {
    $state.go('rooms', {roomName: $scope.roomName})
    $scope.$state = $state
    $scope.roomName = ''
  }
})
