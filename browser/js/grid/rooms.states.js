app.config(function($stateProvider) {
    $stateProvider.state('rooms', {
        cache: false,
        url: '/rooms/:roomName',
        templateUrl: 'js/grid/room.template.html',
        controller: 'WordGameController',
        resolve: {
            location: function() {
                let location = window.location.pathname
                if (location === '/') {
                    return 'root'
                } else {
                    return location.match(/\/rooms\/(\d*\w*)\/?/i)[1]
                }
            }
        }
    })
})
