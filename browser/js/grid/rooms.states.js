app.config(function($stateProvider) {
  $stateProvider.state('rooms', {
    url: '/rooms/:roomName',
    templateUrl: 'js/grid/room.template.html'
  })
})
