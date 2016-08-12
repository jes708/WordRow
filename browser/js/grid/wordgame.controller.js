app.controller("WordGameController", function(GridGameFactory, $state, $stateParams, UserFactory, $scope, Socket, GameFactory, roomFactory, WordFactory) {
    Socket.disconnect();
    Socket.connect();
    GridGameFactory.ScopeDecorator($scope);

    UserFactory.getId()
        .then(user => $scope.user = user)

    $scope.timeRemaining = undefined

    $scope.yourTurn = false

    $scope.showNewGame = true

    $scope.askNew = false

    $scope.messages = undefined

    $scope.redrawsRemaining = 3;

    $scope.playerNumber = undefined

    $scope.selectedCell = undefined

    $scope.gameEnd = false

    $scope.otherCell = undefined

    $scope.enemy = undefined

    $scope.submit = WordFactory.submitWord;

    $scope.pot = [];

    $scope.createPot = WordFactory.createPot

    Socket.on('connect', function() {
        let location = function() {
            let location = window.location.pathname
            if (location === '/') {
                return 'root'
            } else {
                return location.match(/\/rooms\/(\d*\w*)\/?/i)[1]
            }
        }

        $scope.roomName = location()

        roomFactory.getRoom($scope.roomName)
            .then(function(roomInfo) {
                $scope.roomInfo = roomInfo
            })

        Socket.emit('joinRoom', $scope.roomName)

        Socket.on('roomData', function(data) {
            if (data.count.length < 2) {
                $scope.messages = 'Waiting for another player'
            } else {
                $scope.messages = undefined
                $scope.$digest()
            }
        })

        let updateBoard = function(spotData) {
            let cell = $scope.getCell(spotData.x, spotData.y)
            cell.player = $scope.players[spotData.playerNum]
            cell.word = spotData.word
        }

        Socket.on('boardData', function(data) {
            if(data.length === 0) return;
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
            })
            while(data[data.length - 1].pot) {
                data.pop()
            }
            let lastPlayer = data[data.length - 1].playerNum
            if (lastPlayer === $scope.playerNumber) {
                $scope.yourTurn = false
            } else {
                $scope.yourTurn = true
            }
            $scope.p1un = $scope.roomInfo.player1.username;
            $scope.p2un = $scope.roomInfo.player2.username;
            $scope.$digest()
        })

        Socket.on('claimC', function(spotData) {
            updateBoard(spotData)
            $scope.yourTurn = true
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
            $scope.otherCell = undefined
            $scope.messages = spotData.winner + ' wins!'
            updateBoard(spotData)
            $scope.$digest()
        })

        Socket.on('passedTurnC', function() {
            $scope.yourTurn = true
            $scope.$digest()
        })

        Socket.on('selectedC', function(cell) {
            console.log('it happened')
            $scope.otherCell = $scope.getCell(cell.x, cell.y)
            $scope.$digest()
        })

        Socket.on('reqEnemyNameC', function(){
            if (!$scope.user.username || $scope.spectating) return;
            Socket.emit('sendingName', $scope.user.username)
        })

        Socket.on('sendingNameC', function(name){
            $scope.enemy = name
            $scope.$digest()
        })
    })

    let chkLine = function(a, b, c, d) {
        // Check first cell non-zero and all cells match
        return ((a.player) && (a.player === b.player) && (a.player === c.player) && (a.player === d.player));
    }

    let chkWinner = function() {
        // Check down
        let getCell = $scope.getCell
        for (let c = 0; c < 4; c++) {
            if (chkLine(getCell(0, c), getCell(1, c), getCell(2, c), getCell(3, c))) {
                return true;
            }
        }
        // Check right
        for (let r = 0; r < 4; r++) {
            if (chkLine(getCell(r, 0), getCell(r, 1), getCell(r, 2), getCell(r, 3))) {
                return true;
            }
        }
        // Check down-right
        if (chkLine(getCell(0, 0), getCell(1, 1), getCell(2, 2), getCell(3, 3))) {
            return true;
        }
        // Check down-left
        if (chkLine(getCell(3, 0), getCell(2, 1), getCell(1, 2), getCell(0, 3))) {
            return true;
        }

        return false;
    }

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
        $scope.pot = [];
        WordFactory.createPot($scope.pot)
        Socket.emit('pot', {
                playerNum: $scope.playerNumber,
                pot: $scope.pot
            })
    }

    $scope.newGame = function() {
        Socket.emit('reqNewGame')
    }

    $scope.shuffle = function() {
        $scope.pot = WordFactory.shuffle($scope.pot);
    }

    $scope.redraw = function() {
        if ($scope.yourTurn) {
            $scope.pot = [];
            WordFactory.createPot($scope.pot);
            Socket.emit('redraw', $scope.playerNumber)
            Socket.emit('pot', {
                playerNum: $scope.playerNumber,
                pot: $scope.pot
            })

            if ($scope.redrawsRemaining <= 0) {
                Socket.emit('passedTurn');
                $scope.yourTurn = false;
                // $scope.$digest();
            } else if ($scope.redrawsRemaining > 0) {
                $scope.redrawsRemaining--
            }
        }

    };

    $scope.spec = function() {
        $scope.enableBoard = true
        $scope.spectating = true
        Socket.emit('reqBoardData')
    }

    let startGame = function() {
        $scope.enableBoard = true;
        $scope.pot = [];
        WordFactory.createPot($scope.pot);
        Socket.emit('pot', {
            playerNum: $scope.playerNumber,
            pot: $scope.pot
        })
    }

    $scope.joinGame = function() {
        if (!$scope.user) {
            $scope.messages = "You must be logged in to play!"
            setTimeout(function() {
                        $scope.messages = undefined
                        $scope.showNewGame = true
                        $scope.$digest()
                    }, 5000)
        }
        roomFactory.whichPlayer($scope.roomName)
            .then(function(data) {
                if (data === 'room is full') {
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
                    $scope.enemyToken = 'p2'
                    $scope.roomInfo.player1Id = $scope.user.id;
                    $scope.roomInfo.player1 = $scope.user;
                    $scope.roomInfo.player1.username = $scope.user.username;
                    $scope.yourTurn = true
                    Socket.emit('reqBoardData')
                } else if (data === 'Player 2') {
                    startGame()
                    $scope.playerNumber = 1
                    $scope.player = $scope.players[$scope.playerNumber]
                    $scope.enemyToken = 'p1'
                    $scope.roomInfo.player2Id = $scope.user.id;
                    $scope.roomInfo.player2 = $scope.user;
                    $scope.roomInfo.player2.username = $scope.user.username;
                    Socket.emit('reqBoardData')
                }
            })
    }

    $scope.claimCell = function() {
        $scope.yourTurn = false
        Socket.emit('pot', {
            playerNum: $scope.playerNumber,
            pot: $scope.pot
        })
        let winningWord = GameFactory.getWord()
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
                word: winningWord,
                winner: $scope.user.username
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
    }


    $scope.processClick = function(cell) {
        if ($scope.spectating) return;
        Socket.emit('selected', { x: cell.x, y: cell.y })
        if(!$scope.enemy) {
            Socket.emit('reqEnemyName')
        }
        $scope.selectedCell = cell
        GameFactory.setSteal(cell.word)
    }

    let checkGameCompletion = function() {
        let maxPlays = $scope.boardWidth * $scope.boardHeight;
        if ($scope.turns >= maxPlays) {
            $scope.gameStatus = 'complete'
        }
    }


});
