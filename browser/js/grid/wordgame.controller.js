app.controller("WordGameController", function($scope, Socket, GameFactory, roomFactory, WordFactory) {
    GridGameHelp.ScopeDecorator($scope);

    Socket.on('connect', function() {
        console.log(window.location.pathname)
        Socket.emit('joinRoom', window.location.pathname)

        Socket.on('newBoardData', function(spotData) {
            let cell = $scope.getCell(spotData.x, spotData.y)
            cell.player = $scope.players[spotData.playerNum]
            console.log('@@@@', spotData.word)
            cell.word = spotData.word
            $scope.$digest()
        })

        Socket.on('reqNewGameC', function() {
            $scope.askNew = true
            $scope.$digest()
        })

        Socket.on('acceptC', function() {
            $scope.resetGame()
            $scope.$digest()
        })

        Socket.on('declineC', function() {
            $scope.messages = 'New match declined'
            $scope.showNewGame = false
            $scope.$digest()
            setTimeout(function() {
                $scope.messages = undefined
                $scope.showNewGame = true
                $scope.$digest()
            }, 5000)
        })
    })

    function chkLine(a, b, c, d) {
        // Check first cell non-zero and all cells match
        return ((a.player) && (a.player === b.player) && (a.player === c.player) && (a.player === d.player));
    }

    function chkWinner() {
        // Check down
        let getCell = $scope.getCell
        for (let c = 0; c < 4; c++) {
            if (chkLine(getCell(0, c), getCell(1, c), getCell(2, c), getCell(3, c))) {
                console.log('first')
                return true;
            }
        }
        // Check right
        for (let r = 0; r < 4; r++) {
            if (chkLine(getCell(r, 0), getCell(r, 1), getCell(r, 2), getCell(r, 3))) {
                console.log('second')
                return true;
            }
        }
        // Check down-right
        if (chkLine(getCell(0, 0), getCell(1, 1), getCell(2, 2), getCell(3, 3))) {
            console.log('third')
            return true;
        }
        // Check down-left
        if (chkLine(getCell(3, 0), getCell(2, 1), getCell(1, 2), getCell(0, 3))) {
            console.log('four')
            return true;
        }

        return false;
    }


    $scope.showNewGame = true

    $scope.askNew = false

    $scope.messages = undefined

    Socket.on('servertoldyoutoupdate', function() {
        $scope.board = boardFactory.getBoard()
    })

    $scope.accept = function() {
        $scope.askNew = false
        $scope.resetGame()
        Socket.emit('accept')
    }

    $scope.decline = function() {
            Socket.emit('decline')
            $scope.askNew = false
        }
        // $scope.processClick = function(cell){
        //   if(processSideEffects(cell)){
        //     $scope.placeToken(cell);
        //     $scope.passPlay()
        //     $scope.activePlayer().addPoints(1)
        //     checkGameCompletion();
        //   }
        //   // game logic for check word
        // }

    $scope.resetGame = function() {
        for (var i = 0; i < $scope.gameBoard.rows.length; i++) {
            for (var j = 0; j < $scope.gameBoard.rows[i].length; j++) {
                let cell = $scope.getCell(i, j)
                cell.player = undefined
                cell.word = undefined
                console.log($scope.getCell(i, j))
            }
        }
    }

    $scope.newGame = function() {
        Socket.emit('reqNewGame')
    }

    $scope.playerNumber = undefined

    //set after player has join the room, make sure room is not full
    $scope.whichPlayer = function() {
        $scope.enableBoard = true;
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
        console.log(chkWinner())
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
