"use strict";

const mongoDbAdapter = require('./mongoDbAdapter');

// using in memory array for now
// long term we should move to MongoDB
var ongoingGames = new Map();

async function storeNewGame(gameId, game) {
    // await mongoDbAdapter.storeNewGame(gameId, game); // TODO uncomment when wiring up mongodb
    console.log("storing new game, id= " + gameId);
    if (!ongoingGames.has(gameId)) {
        ongoingGames.set(gameId, game);
    }
}

async function findGameWithPlayerId(playerId) {
    // return await mongoDbAdapter.findGameWithPlayerId(playerId); // TODO uncomment when wiring up mongodb
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

async function getGame(gameId) {
    // return await mongoDbAdapter.getGame(gameId); // TODO uncomment when wiring up mongodb
    let game = ongoingGames.get(gameId);
    if (game) {
        return game;
    }
    console.log("Tried to get a non-existent game, id= " + gameId);
    return null;
}

async function updateGame(gameId, game) {
    // await mongoDbAdapter.updateGame(gameId, game); // TODO uncomment when wiring up mongodb
    if (ongoingGames.has(gameId)) {
        ongoingGames.set(gameId, game);
    }
    else {
        console.log("Tried to update a game that doesn't exist, id= " + gameId);
    }
}

async function deleteGame(gameId) {
    // await mongoDbAdapter.deleteGame(gameId); // TODO uncomment when wiring up mongodb
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