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

function buildErrorObject(errorMessage) {
    console.log("Building error object: " + errorMessage);
    return {
        type: "errorMessage",
        success: false,
        errorMessage: errorMessage
    };
}

function validate(json, validatorFunc, notifyCallerFunc) {
    var result = new Result.Result();
    validatorFunc(json, result);
    if (result.success == false) {
        notifyCallerFunc(buildErrorObject(result.errorMessage));
    }
    return result.success;
}

function validateGame(gameId, game, notifyCallerFunc) {
    if (!game) {
        notifyCallerFunc(buildErrorObject("no game with id " + gameId));
        return false;
    }
    return true;
}

function createGame(json, notifyCallerFunc) {
    if (!validate(json, gamesManagerValidator.checkCreateGameJson, notifyCallerFunc)) {
        return;
    }

    let gameId = uuidv4();
    var game;
    try {
        game = new tf.Game(gameId, json.numberOfPlayers, json.gameRules);
    } catch (err) {
        notifyCallerFunc(buildErrorObject("Failed to create game with error message: " + err));
        return;
    }

    gameModel.storeNewGame(gameId, game).then(() => {
        notifyConnected(game.id, "createGameAck", notifyCallerFunc);

        gameStateMachineOperator.initGame(game);

        let selfPlayer = buildPlayerFromPlayerDetails(json.playerDetails);
        addPlayer(game, selfPlayer, notifyCallerFunc);
    }, (failure) => handleModelOperationFailure(notifyCallerFunc, failure));
}

function handleModelOperationFailure(notifyCallerFunc, failure) {
    let errorObject = buildErrorObject("Failed in Model operation, reason: " + failure);
    if (notifyCallerFunc) {
        notifyCallerFunc(errorObject);
    }
}

function joinGame(json, notifyCallerFunc) {
    if (!validate(json, gamesManagerValidator.checkJoinGameJson, notifyCallerFunc)) {
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!validateGame(gameId, game, notifyCallerFunc)) {
            return;
        }
    
        notifyConnected(game.id, "joinGameAck", notifyCallerFunc);
        let player = buildPlayerFromPlayerDetails(json.playerDetails);
        addPlayer(game, player, notifyCallerFunc);
    }, (failure) => handleModelOperationFailure(notifyCallerFunc, failure));
}

function requestAIs(json, sendMessageToCaller) {
    if (!validate(json, gamesManagerValidator.checkRequestAIsJson, sendMessageToCaller)) {
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!validateGame(gameId, game, sendMessageToCaller)) {
            return;
        }

        gameStateMachineOperator.fillWithAis(game);
    }, (failure) => handleModelOperationFailure(sendMessageToCaller, failure));
}

function startGame(json, sendMessageToCaller) {
    if (!validate(json, gamesManagerValidator.checkStartGameJson, sendMessageToCaller)) {
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!validateGame(gameId, game, sendMessageToCaller)) {
            return;
        }
    
        gameStateMachineOperator.startGame(game);
    }, (failure) => handleModelOperationFailure(sendMessageToCaller, failure));
}

function playerAction(json, sendMessageToCaller) {
    if (!validate(json, gamesManagerValidator.checkPlayerActionJson, sendMessageToCaller)) {
        return;
    }

    let gameId = json.gameId;
    gameModel.getGame(gameId).then((game) => {
        if (!validateGame(gameId, game, sendMessageToCaller)) {
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
    }, (failure) => handleModelOperationFailure(sendMessageToCaller, failure));
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
            gameModel.deleteGame(game);
            // notify?
        }
    }, (failure) => handleModelOperationFailure(null, failure));
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