"use strict";

const mongoDbAdapter = require('./mongoDbAdapter');

// using in memory array for now
// long term we should move to MongoDB
var ongoingGames = new Map();

function storeNewGame(gameId, game) {
    mongoDbAdapter.storeNewGame(gameId, game);
    console.log("storing new game, id= " + gameId);
    if (!ongoingGames.has(gameId)) {
        ongoingGames.set(gameId, game);
    }
}

function findGameWithPlayerId(playerId) {
    mongoDbAdapter.findGameWithPlayerId(playerId);
    const iter = ongoingGames.values();
    let result = iter.next();
    while (!result.done) {
        let game = result.value;
        if (game.players.findIndex((p) => p.id == playerId) > -1) {
            return game;
        }
        else {
            result = iter.next();
        }
    }
    return null;
}

function getGame(gameId) {
    mongoDbAdapter.getGame(gameId);
    let game = ongoingGames.get(gameId);
    if (game) {
        return game;
    }
    console.log("Tried to get a non-existent game, id= " + gameId);
    return null;
}

function updateGame(gameId, game) {
    mongoDbAdapter.updateGame(gameId, game);
    if (ongoingGames.has(gameId)) {
        ongoingGames.set(gameId, game);
    }
    else {
        console.log("Tried to update a game that doesn't exist, id= " + gameId);
    }
}

function deleteGame(gameId) {
    mongoDbAdapter.deleteGame(gameId);
    console.log("deleting game, id= " + gameId);
    ongoingGames.delete(gameId);
}

(function () {
    let e = {};
    e.storeNewGame = storeNewGame;
    e.findGameWithPlayerId = findGameWithPlayerId;
    e.getGame = getGame;
    e.updateGame = updateGame;
    e.deleteGame = deleteGame;

    module.exports = e;
})();