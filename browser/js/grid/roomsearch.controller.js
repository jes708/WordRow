app.controller('roomsearchCtrl', function($scope, $state){
  $scope.go = function() {
    $state.go('rooms', {roomName: $scope.roomName})
    $scope.roomName = ''
  }
})
