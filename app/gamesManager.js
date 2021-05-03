"use strict";

const { v4: uuidv4 } = require('uuid');

let tf = require('twentyfive');

const Result = require('./result.js');
const jsonValidator = require('./jsonValidator.js');

function getGameUrl() {
    return "http://twentyfiveweb.s3-website-eu-west-1.amazonaws.com";
    // return "127.0.0.1:5500"; // for local testing
}

var ongoingGames = [];
function findGameById(id) {
    // TODO change this to use DB/proper persistence
    let index = ongoingGames.findIndex((game) => game.id == id);
    if (index >= 0) {
        return ongoingGames[index];
    }
    return null;
}

function validateJson(json, validFields, objectName, result) {
    let validator = jsonValidator.buildValidatorWithJson(objectName, json, validFields);
    validator.validate(result);
}

function checkPlayerDetails(playerDetails, result) {
    validateJson(playerDetails, ["name", "userId"], "playerDetails", result);
}

function checkCreateGameJson(json, result) {
    validateJson(json, ["type", "numberOfPlayers", "playerDetails"], "request", result);
    checkPlayerDetails(json.playerDetails, result);
}

function checkJoinGameJson(json, result) {
    validateJson(json, ["type", "gameId", "playerDetails"], "request", result);
    checkPlayerDetails(json.playerDetails, result);
}

function checkRequestAIsJson(json, result) {
    validateJson(json, ["type", "gameId"], "request", result);
}

function checkStartGameJson(json, result) {
    validateJson(json, ["type", "gameId"], "request", result);
}

function checkPlayerActionJson(json, result) {
    if (!("playerActionType" in json)) {
        result.errorMessage = "playerActionType property must be present in payload"
        return;
    }

    var gameFields = ["type", "gameId", "userId", "playerActionType"];
    if (json.playerActionType === "playCard") {
        gameFields.push("cardDetails");
    }
    else if (json.playerActionType === "robTrumpCard") {
        gameFields.push("droppedCardDetails");
    }
    validateJson(json, gameFields, "request", result);
}

function buildPlayerFromPlayerDetails(playerDetails) {
    var p = new tf.Player(playerDetails.name);
    p.id = playerDetails.userId;
    return p;
}

function removeGame(gameId) {
    let gameIndex = ongoingGames.findIndex((g) => g.id == gameId);
    if (gameIndex != -1) {
        console.log("removing game with index=" + gameIndex);
        ongoingGames.splice(gameIndex, 1);
    }
}

function createGame(json, sendMessageToClient, callback) {
    var result = new Result.Result();
    checkCreateGameJson(json, result);
    if (result.success === false) {
        callback({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = uuidv4();

    let handleStateChangesFunc = function(newState) {
        console.log("Game " + gameId + " changed state to " + newState);
        if (newState == tf.GameState.gameFinished) {
            removeGame(gameId);
        }
    }

    let gameMgr = new tf.Game(gameId, json.numberOfPlayers, sendMessageToClient, handleStateChangesFunc);
    ongoingGames.push(gameMgr);

    // TODO fix this :)
    let gameUrl = getGameUrl() + "/?gameId=" + gameMgr.id;
    callback({
         type: "createGameAck", 
         success: true, 
         gameId: gameMgr.id,
         gameUrl: gameUrl
    });

    gameMgr.init();

    let selfPlayer = buildPlayerFromPlayerDetails(json.playerDetails);
    gameMgr.addPlayer(selfPlayer);
}

function joinGame(json, callback) {
    var result = new Result.Result();
    checkJoinGameJson(json, result);
    if (result.success === false) {
        callback({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    let gameMgr = findGameById(gameId);
    if (!gameMgr) {
        callback({ success: false, errorMessage: "no game with id " + gameId });
        return;
    }

    let gameUrl = getGameUrl() + "/?gameId=" + gameMgr.id;

    callback({
        type: "joinGameAck", 
        success: true, 
        gameId: gameMgr.id,
        gameUrl: gameUrl
   });
    let player = buildPlayerFromPlayerDetails(json.playerDetails);
    gameMgr.addPlayer(player);
}

function requestAIs(json, sendMessageToCaller) {
    var result = new Result.Result();
    checkRequestAIsJson(json, result);
    if (result.success === false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    let gameMgr = findGameById(gameId);
    if (!gameMgr) {
        sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
        return;
    }

    if (gameMgr.players.length !== gameMgr.numberOfPlayers) {
        gameMgr.fillWithAis();
    }
    else {
        sendMessageToCaller({ success: false, errorMessage: "Enough players in the game already" });
    }
}

function startGame(json, sendMessageToCaller) {
    var result = new Result.Result();
    checkStartGameJson(json, result);
    if (result.success === false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    let gameMgr = findGameById(gameId);
    if (!gameMgr) {
        sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
        return;
    }

    if (gameMgr.needsMorePlayers()) {
        sendMessageToCaller({ success: false, errorMessage: "Not enough players or AIs in game" });
        return;
    }

    gameMgr.start();
}

function playerAction(json, sendMessageToCaller) {
    var result = new Result.Result();
    checkPlayerActionJson(json, result);
    if (result.success === false) {
        sendMessageToCaller({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameId = json.gameId;
    let gameMgr = findGameById(gameId);
    if (!gameMgr) {
        sendMessageToCaller({ success: false, errorMessage: "no game with id " + gameId });
        return;
    }

    let playerActionType = json.playerActionType;
    if (playerActionType === "playCard") {
        gameMgr.playCardWithId(json.userId, json.cardDetails)
    }
    else if (playerActionType === "robTrumpCard") {
        gameMgr.robTrumpCard(json.userId, json.droppedCardDetails);
    }
    else if (playerActionType === "skipRobTrumpCard") {
        gameMgr.skipRobTrumpCard(json.userId);
    }
    else if (playerActionType === "startNextRound") {
        gameMgr.markPlayerReadyForNextRound(json.userId);
    }
}

function handlePlayerDrop(playerId) {
    let gameIndex = ongoingGames.findIndex(function(game) {
        return game.players.findIndex((p) => p.id == playerId) != -1;
    });
    if (gameIndex == -1) {
        // log?
        return;
    }

    let gameMgr = ongoingGames[gameIndex];

    // we want to only remove the player if the game hasn't started yet
    if (gameMgr.currentState == tf.GameState.waitingForPlayers) {
        gameMgr.removePlayer({ id: playerId });
    }
    else {
        // There's currently no way to handle missing players
        // best thing to do is to bail out
        removeGame(gameMgr.id);
    }
}

(function () {
    let gamesManagerExports = {};
    gamesManagerExports.createGame = createGame;
    gamesManagerExports.joinGame = joinGame;
    gamesManagerExports.requestAIs = requestAIs;
    gamesManagerExports.startGame = startGame;
    gamesManagerExports.playerAction = playerAction;
    gamesManagerExports.handlePlayerDrop = handlePlayerDrop;
    
    module.exports = gamesManagerExports;
})();
