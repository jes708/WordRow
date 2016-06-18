app.controller("WordGameController", function($scope, Socket, GameFactory, roomFactory, WordFactory) {
    GridGameHelp.ScopeDecorator($scope);

    Socket.on('connect', function() {
        console.log(window.location.pathname)
        Socket.emit('joinRoom', window.location.pathname)

        Socket.on('roomData', function(data) {
            console.log('roomData happened', data)
            if (data.count.length < 2) {
                console.log('data.count: ', data.count)
                $scope.messages = 'Waiting for another player'
                // $scope.yourTurn = true
            } else {
                $scope.messages = undefined
                // $scope.enableBoard = true
                $scope.$digest()
            }
        })

        function updateBoard(spotData) {
            let cell = $scope.getCell(spotData.x, spotData.y)
            cell.player = $scope.players[spotData.playerNum]
            cell.word = spotData.word
        }

        Socket.on('claimC', function(spotData) {
            updateBoard(spotData)
            $scope.yourTurn = true
            $scope.timer = new timer(function() {
              Socket.emit('passedTurn')
              $scope.yourTurn = false
              $scope.$digest()
            }, 20000)
            console.log($scope.yourTurn)
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

        Socket.on('claimEndC', function(spotData) {
            $scope.gameEnd = true
            $scope.yourTurn = true
            $scope.messages = 'You have lost'
            updateBoard(spotData)
            $scope.$digest()
        })

        Socket.on('passedTurnC', function() {
          $scope.yourTurn = true
          $scope.timer = new timer(function() {
            Socket.emit('passedTurn')
            $scope.yourTurn = false
            $scope.$digest()
          }, 20000)
          $scope.$digest()
        })
    })

    function timer(callback, delay) {
        var id, started, remaining = delay, running

        this.start = function() {
            running = true
            started = new Date()
            id = setTimeout(callback, remaining)
        }

        this.pause = function() {
            running = false
            clearTimeout(id)
            remaining -= new Date() - started
        }

        this.getTimeLeft = function() {
            if (running) {
                this.pause()
                this.start()
            }

            return remaining
        }

        this.getStateRunning = function() {
            return running
        }

        this.start()
    }

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

    $scope.yourTurn = false

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

    $scope.resetGame = function() {
        $scope.redrawsRemaining = 3;
        for (var i = 0; i < $scope.gameBoard.rows.length; i++) {
            for (var j = 0; j < $scope.gameBoard.rows[i].length; j++) {
                let cell = $scope.getCell(i, j)
                cell.player = undefined
                cell.word = undefined
            }
        }
        $scope.messages = undefined
        $scope.gameEnd = false;
    }

    $scope.newGame = function() {
        Socket.emit('reqNewGame')
    }

    $scope.redrawsRemaining = 3;

    $scope.playerNumber = undefined


      $scope.submit = WordFactory.submitWord;

      $scope.pot = [];

      $scope.createPot = WordFactory.createPot

      $scope.shuffle = function() {
        $scope.pot = WordFactory.shuffle($scope.pot);
      }

      $scope.redraw = function() {
        if ($scope.redrawsRemaining) {
        $scope.redrawsRemaining--
        console.log($scope.redrawsRemaining);
          $scope.pot = [];
          WordFactory.createPot($scope.pot);
        }
      };

      // $scope.verify = function(pot, word) {
      //   if ($scope.gameStatus) return;
      //   if (!$scope.yourTurn) return;
      //   let steal = GameFactory.getSteal();
      //   if (WordFactory.verify(pot, word, steal)) {

      //     WordFactory.submitWord(word)
      //     .then(function(wordRes) {
      //       if (wordRes.data) {
      //         console.log('word res: ', wordRes.data.word)
      //         WordFactory.endTurn(pot, word, steal);
      //         WordFactory.createPot(pot);
      //         GameFactory.setWord(wordRes.data.word)
      //         console.log("HELLO", $scope.word);
      //         $scope.claimCell();
      //       } else {
      //         $scope.message = "Invalid word";
      //       }
      //     });

      //   } else {
      //     $scope.message = "Invalid letters";
      //   }
      // };


    //set after player has join the room, make sure room is not full
    $scope.joinGame = function() {
        console.log("cool", $scope.redrawsRemaining)
        WordFactory.createPot($scope.pot);
        $scope.enableBoard = true;
        roomFactory.whichPlayer(window.location.pathname)
            .then(function(data) {
                // console.log('it happened')
                if (data === 'room is full') {
                    //do nothing, but tell them room is full
                    console.log('room is full')
                } else if (data === 'Player 1') {
                    $scope.playerNumber = 0
                    $scope.player = $scope.players[$scope.playerNumber]
                    $scope.yourTurn = true
                    $scope.timer = new timer(function() {
                      Socket.emit('passedTurn')
                      $scope.yourTurn = false
                      $scope.$digest()
                    }, 20000)
                    console.log($scope.player.token)
                    console.log($scope.playerNumber)
                } else if (data === 'Player 2') {
                    $scope.playerNumber = 1
                    $scope.player = $scope.players[$scope.playerNumber]
                    // $scope.$digest()
                    console.log($scope.player.token)
                    console.log($scope.playerNumber)
                }
            })
    }


    $scope.selectedCell = undefined

    $scope.gameEnd = false

    //word controller should call this, if user is successful coming up with word
    $scope.claimCell = function() {
        $scope.timer = undefined
        $scope.yourTurn = false
        let winningWord = GameFactory.getWord()
        console.log('claimed word: ', winningWord)
        let cell = $scope.getCell($scope.selectedCell.x, $scope.selectedCell.y)
        cell.player = $scope.players[$scope.playerNumber]
        cell.word = winningWord
        if (chkWinner()) {
            $scope.gameEnd = true
            $scope.messages = 'You have won!'
            Socket.emit('claimEnd', {
                playerNum: $scope.playerNumber,
                x: $scope.selectedCell.x,
                y: $scope.selectedCell.y,
                word: winningWord
            })
        } else {
            Socket.emit('claim', {
                playerNum: $scope.playerNumber,
                x: $scope.selectedCell.x,
                y: $scope.selectedCell.y,
                word: winningWord
            })
        }
        $scope.selectedCell = undefined
            // $scope.$digest()
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
