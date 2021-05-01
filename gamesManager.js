"use strict";

const { v4: uuidv4 } = require('uuid');

//let tf = require('./twentyfive/index.js'); // TODO - change this to proper node module
let tf = require('twentyfive');

const Result = require('./result.js');
const jsonValidator = require('./jsonValidator.js');

function getGameUrl() {
    return "127.0.0.1:5500"; // TODO hardcode to a well known location when setup
}

var ongoingGames = [];
function findGameById(id) {
    // TODO change this to use DB/proper persistence
    // This currently results in a memory leak
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

function createGame(json, sendMessageToClient, callback) {
    var result = new Result.Result();
    checkCreateGameJson(json, result);
    if (result.success === false) {
        callback({ success: result.success, errorMessage: result.errorMessage });
        return;
    }

    let gameMgr = new tf.Game(uuidv4(), json.numberOfPlayers, sendMessageToClient);
    ongoingGames.push(gameMgr);
    // TODO fix this :)
    let gameUrl = getGameUrl() + "/?gameId=" + gameMgr.id;
    callback({
         type: "createGameAck", 
         success: true, 
         gameId: gameMgr.id,
         gameUrl: gameUrl
    });

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

(function () {
    let gamesManagerExports = {};
    gamesManagerExports.createGame = createGame;
    gamesManagerExports.joinGame = joinGame;
    gamesManagerExports.requestAIs = requestAIs;
    gamesManagerExports.startGame = startGame;
    gamesManagerExports.playerAction = playerAction;
    
    module.exports = gamesManagerExports;
})();