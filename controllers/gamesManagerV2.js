"use strict";

const { v4: uuidv4 } = require('uuid');
const tf = require('twentyfive');

const Result = require('../helpers/result');
const gamesManagerValidator = require('./gamesManagerValidator');
const gameStateMachineOperator = require('../twentyfive/gameStateMachineOperator');

const gameModel = require('../model/gameModel');
const playerNotifierModel = require('../model/playerNotifierModel');

const gameBaseUrl = "http://twentyfivecardgame.com";


function buildPlayerFromPlayerDetails(playerDetails) {
    var p = new tf.Player(playerDetails.name);
    p.id = playerDetails.userId;
    return p;
}

function notifyConnected(gameId, type, notifyCaller) {
    let gameUrl = gameBaseUrl + "/?gameId=" + gameId;
    notifyCaller({
        type: type, 
        success: true, 
        gameId: gameId,
        gameUrl: gameUrl
    });
}

function addPlayer(game, player, notifyCallerFunc) {
    playerNotifierModel.addPlayerNotifier(game.id, player.id, notifyCallerFunc);
    gameStateMachineOperator.addPlayer(game, player);
}

function createGame(json, notifyCallerFunc) {
    var result = new Result.Result();
    gamesManagerValidator.checkCreateGameJson(json, result);
    if (result.success == false) {
        notifyCallerFunc({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = uuidv4();
    let game = new tf.Game(gameId, json.numberOfPlayers); // TODO add support for setting rules from client
    gameModel.storeNewGame(gameId, game).then(() => {
        notifyConnected(game.id, "createGameAck", notifyCallerFunc);

        gameStateMachineOperator.initGame(game);

        let selfPlayer = buildPlayerFromPlayerDetails(json.playerDetails);
        addPlayer(game, selfPlayer, notifyCallerFunc);
    }, handleModelOperationFailure);
}

function handleModelOperationFailure(failure) {
    console.log("Failed in Model operation, reason: ", failure);
}

function joinGame(json, notifyCallerFunc) {
    var result = new Result.Result();
    gamesManagerValidator.checkJoinGameJson(json, result);
    if (result.success == false) {
        notifyCallerFunc({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!game) {
            notifyCallerFunc({ success: false, errorMessage: "no game with id " + gameId });
            return;
        }
    
        notifyConnected(game.id, "joinGameAck", notifyCallerFunc);
        let player = buildPlayerFromPlayerDetails(json.playerDetails);
        addPlayer(game, player, notifyCallerFunc);
    }, handleModelOperationFailure);
}

function requestAIs(json, sendMessageToCaller) {
    var result = new Result.Result();
    gamesManagerValidator.checkRequestAIsJson(json, result);
    if (result.success == false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!game) {
            sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
            return;
        }

        gameStateMachineOperator.fillWithAis(game);
    }, handleModelOperationFailure);
}

function startGame(json, sendMessageToCaller) {
    var result = new Result.Result();
    gamesManagerValidator.checkStartGameJson(json, result);
    if (result.success == false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!game) {
            sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
            return;
        }
    
        gameStateMachineOperator.startGame(game);
    }, handleModelOperationFailure);
}

function playerAction(json, sendMessageToCaller) {
    var result = new Result.Result();
    gamesManagerValidator.checkPlayerActionJson(json, result);
    if (result.success == false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!game) {
            sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
            return;
        }
    
        let playerActionType = json.playerActionType;
        if (playerActionType === "playCard") {
            gameStateMachineOperator.playCardWithId(game, json.userId, json.cardDetails)
        }
        else if (playerActionType === "robTrumpCard") {
            gameStateMachineOperator.robTrumpCard(game, json.userId, json.droppedCardDetails);
        }
        else if (playerActionType === "skipRobTrumpCard") {
            gameStateMachineOperator.skipRobTrumpCard(game, json.userId);
        }
        else if (playerActionType === "startNextRound") {
            gameStateMachineOperator.markPlayerReadyForNextRound(game, json.userId);
        }
    }, handleModelOperationFailure);
}

function handlePlayerDrop(playerId) {
    gameModel.findGameWithPlayerId(playerId).then((game) => {
        if (!game) {
            //log?
            return;
        }
    
        // we want to only remove the player if the game hasn't started yet
        if (game.currentState == tf.GameState2.waitingForPlayers || game.currentState == tf.GameState2.readyToPlay) {
            gameStateMachineOperator.removePlayer(game, playerId);
        }
        else {
            // There's currently no way to handle missing players
            // best thing to do is to bail out
            gameModel.deleteGame(game.id);
            // notify?
        }
    }, handleModelOperationFailure);
}

(function () {
    let e = {};
    e.createGame = createGame;
    e.joinGame = joinGame;
    e.requestAIs = requestAIs;
    e.startGame = startGame;
    e.playerAction = playerAction;
    e.handlePlayerDrop = handlePlayerDrop;
    
    module.exports = e;
})();