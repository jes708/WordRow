app.controller("WordGameController", function($scope, Socket, GameFactory, roomFactory, WordFactory) {
    GridGameHelp.ScopeDecorator($scope);

    Socket.on('connect', function() {
        console.log(window.location.pathname)
        Socket.emit('joinRoom', window.location.pathname)

        Socket.on('newBoardData', function(spotData) {
          let cell= $scope.getCell(spotData.x, spotData.y)
          cell.player = $scope.players[spotData.playerNum]
          console.log('@@@@', spotData.word)
          cell.word = spotData.word
          $scope.$digest()
        })
    })

    Socket.on('servertoldyoutoupdate', function() {
        $scope.board = boardFactory.getBoard()
    })

    // $scope.processClick = function(cell){
    //   if(processSideEffects(cell)){
    //     $scope.placeToken(cell);
    //     $scope.passPlay()
    //     $scope.activePlayer().addPoints(1)
    //     checkGameCompletion();
    //   }
    //   // game logic for check word
    // }

    $scope.newGame = function() {
        //set token fo defaults
        for (var i = 0; i < $scope.gameBoard.rows.length; i++) {
            for (var j = 0; j < $scope.gameBoard.rows[i].length; j++) {
                $scope.getCell(i, j).player = undefined
                console.log($scope.getCell(i, j))
            }
        }
        $scope.activePlayerId = $scope.firstPlayer.id
            // $scope.getCell(3,3).player = $scope.activePlayer()
            // $scope.getCell(4,3).player = $scope.nextPlayer()

        //reset game
        //activePlayer & nextPlayer 2 players
    }

    $scope.playerNumber = undefined

    //set after player has join the room, make sure room is not full
    $scope.whichPlayer = function() {
        roomFactory.whichPlayer(window.location.pathname)
            .then(function(data) {
                // console.log('it happened')
                if (data === 'room is full') {
                    //do nothing, but tell them room is full
                    console.log('room is full')
                } else if (data === 'Player 1') {
                    $scope.playerNumber = 0
                    console.log($scope.playerNumber)
                } else if (data === 'Player 2') {
                    $scope.playerNumber = 1
                    console.log($scope.playerNumber)
                }
            })
    }


    $scope.selectedCell = undefined

    //word controller should call this, if user is successful coming up with word
    $scope.claimcell = function() {
      let winningWord = GameFactory.getWord()
      console.log('claimed word: ', winningWord)
      let cell = $scope.getCell($scope.selectedCell.x, $scope.selectedCell.y)
      cell.player = $scope.players[$scope.playerNumber]
      cell.word = winningWord
      // $scope.$digest()
      Socket.emit('claim', {
        playerNum: $scope.playerNumber,
        x: $scope.selectedCell.x,
        y: $scope.selectedCell.y,
        word: winningWord
      })
      $scope.selectedCell = undefined
    }


    $scope.processClick = function(cell) {
        // console.log($scope.playerNumber)
        // $scope.selectedCell = cell
        // cell.player = $scope.players[$scope.playerNumber]
        $scope.selectedCell = cell
        GameFactory.setSteal(cell.word)
    }


    $scope.completedWord = function() {
        //call factory to update board
        //Socket.emit('updateyourboard')
    }

    var checkGameCompletion = function() {
        var maxPlays = $scope.boardWidth * $scope.boardHeight;
        if ($scope.turns >= maxPlays) {
            $scope.gameStatus = 'complete'
        }
    }


});
