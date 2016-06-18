app.controller("WordGameController", function($state, $stateParams, UserFactory, $scope, Socket, GameFactory, roomFactory, WordFactory) {
    GridGameHelp.ScopeDecorator($scope);

    UserFactory.getId()
        .then(user => { $scope.user = user;
            console.log('here', user) })

    Socket.on('connect', function() {
        console.log(window.pathname)

        $scope.roomName = location()

        function location() {
            let location = window.location.pathname
            if (location === '/') {
                return 'root'
            } else {
                return location.match(/\/rooms\/(\d*\w*)\/?/i)[1]
            }
        }

        roomFactory.getRoom($scope.roomName)
            .then(function(roomInfo) {
                $scope.roomInfo = roomInfo
                console.log(roomInfo)
            })
        Socket.emit('joinRoom', $scope.roomName)

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
            // console.log('spotData', spotData)
            // console.log('spotData', isNaN(spotData.x))
            // console.log('spotData', isNaN(spotData.y))
            var cell = $scope.getCell(spotData.x, spotData.y)
                // console.log($scope.getCell)
            cell.player = $scope.players[spotData.playerNum]
            cell.word = spotData.word
        }

        Socket.on('boardData', function(data) {
            console.log('boardData', data)
            if (data.length === 0) return;
            data.forEach(function(move) {
                if (move.redraw) {
                    if (move.playerNum === $scope.playerNumber) {
                        $scope.redrawsRemaining--
                    }
                } else if (move.pot) {
                    if (move.playerNum === $scope.playerNumber) {
                        $scope.pot = move.pot
                    }
                } else {
                    updateBoard(move)
                }
                console.log('updating board')
            })
            let lastPlayer = data[data.length - 1].playerNum
            if (lastPlayer === $scope.playerNumber) {
                $scope.yourTurn = false
            } else {
                $scope.yourTurn = true
            }
            $scope.$digest()
        })

        Socket.on('claimC', function(spotData) {
            updateBoard(spotData)
            $scope.yourTurn = true
                // $scope.timer = new timer(function() {
                //         Socket.emit('passedTurn')
                //         $scope.yourTurn = false
                //         $scope.$digest()
                //     }, 20000)
                // $scope.timerChecker = $interval(function() {
                //   $scope.timeRemaining = $scope.timer.getTimeLeft()
                //   $scope.$digest()
                // }, 1000)
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
                // $scope.timer = new timer(function() {
                //         Socket.emit('passedTurn')
                //         $scope.yourTurn = false
                //         $scope.$digest()
                //     }, 20000)
                // $scope.timerChecker = $interval(function() {
                //   $scope.timeRemaining = $scope.timer.getTimeLeft()
                //   $scope.$digest()
                // }, 1000)
            $scope.$digest()
        })
    })

    // function timer(callback, delay) {
    //     var id, started, remaining = delay,
    //         running

    //     this.start = function() {
    //         running = true
    //         started = new Date()
    //         id = setTimeout(callback, remaining)
    //     }

    //     this.pause = function() {
    //         running = false
    //         clearTimeout(id)
    //         remaining -= new Date() - started
    //     }

    //     this.getTimeLeft = function() {
    //         if (running) {
    //             this.pause()
    //             this.start()
    //         }

    //         return remaining
    //     }

    //     this.getStateRunning = function() {
    //         return running
    //     }

    //     this.start()
    // }

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

    $scope.timeRemaining = undefined

    // $scope.timerChecker = undefined

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
            Socket.emit('redraw', $scope.playerNumber)
            Socket.emit('pot', {
                playerNum: $scope.playerNumber,
                pot: $scope.pot
            })
        }
    };


    $scope.spec = function() {
        $scope.enableBoard = true
        $scope.spectating = true
    }

    function startGame() {
        $scope.enableBoard = true;
        WordFactory.createPot($scope.pot);
    }

    //set after player has join the room, make sure room is not full
    $scope.joinGame = function() {
        console.log("cool", $scope.redrawsRemaining)
        if($scope.roomName === '') {
            javascript:history.go(0)
        }
        roomFactory.whichPlayer($scope.roomName)
            .then(function(data) {
                // console.log('it happened')
                if (data === 'room is full') {
                    //do nothing, but tell them room is full
                    $scope.messages = 'room is full'
                    setTimeout(function() {
                        $scope.messages = undefined
                        $scope.showNewGame = true
                        $scope.$digest()
                    }, 5000)
                } else if (data === 'Player 1') {
                    startGame()
                    $scope.playerNumber = 0
                    $scope.player = $scope.players[$scope.playerNumber]
                    $scope.roomInfo.player1 = $scope.user.id;
                    $scope.yourTurn = true
                    Socket.emit('reqBoardData')
                        // $scope.timer = new timer(function() {
                        //         Socket.emit('passedTurn')
                        //         $scope.yourTurn = false
                        //         $scope.$digest()
                        //     }, 20000)
                        // $scope.timerChecker = $interval(function() {
                        //   $scope.timeRemaining = $scope.timer.getTimeLeft()
                        //   $scope.$digest()
                        // }, 1000)
                    console.log($scope.player.token)
                    console.log($scope.playerNumber)
                } else if (data === 'Player 2') {
                    startGame()
                    $scope.playerNumber = 1
                    $scope.player = $scope.players[$scope.playerNumber]
                    $scope.roomInfo.player2 = $scope.user.id;
                    Socket.emit('reqBoardData')
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
        // $scope.timer = undefined
        // $scope.timerChecker = undefined
        $scope.yourTurn = false
        Socket.emit('pot', {
            playerNum: $scope.playerNumber,
            pot: $scope.pot
        })
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
