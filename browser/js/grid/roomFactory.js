app.factory('roomFactory', function($http){
  return {
    whichPlayer: function(room) {
      return $http.post('/api/room', {room: room})
      .then(info => info.data)
    }
  }
})
