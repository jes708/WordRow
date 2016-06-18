app.factory('UserFactory', function($http){
  return {
    getId: function (){
      return $http.get('/api/users/auth/me')
      .then(info => info.data)
    }
  }
})
