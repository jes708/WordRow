app.controller("WordGameController", function($scope, Socket){
  GridGameHelp.ScopeDecorator($scope);

  // $scope.players = []

  Socket.on('connect', function(){
    Socket.emit('newPlayer', window.location.pathname)

    Socket.on('newPlayer', function(data){
      console.log('i hit here')
      $scope.players.push(data)
      console.log($scope.players)
    })
  })

  $scope.processClick = function(cell){
    if(processSideEffects(cell)){
      $scope.placeToken(cell);
      $scope.passPlay()
      $scope.activePlayer().addPoints(1)
      checkGameCompletion();
    }
    // game logic for check word
  }

  $scope.newGame = function(){
    //set token fo defaults
    for (var i = 0; i < $scope.gameBoard.rows.length; i++) {
      for (var j = 0; j < $scope.gameBoard.rows[i].length; j++) {
        $scope.getCell(i,j).player = undefined
      }
    }
    $scope.activePlayerId = $scope.firstPlayer.id
    // $scope.getCell(3,3).player = $scope.activePlayer()
    // $scope.getCell(4,3).player = $scope.nextPlayer()

    //reset game
    //activePlayer & nextPlayer 2 players
  }

  var checkGameCompletion = function(){
    var maxPlays = $scope.boardWidth * $scope.boardHeight;
    if($scope.turns >= maxPlays){
      $scope.gameStatus = 'complete'
    }
  }


});
