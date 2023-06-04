"use strict";

const databaseAdapter = require('./databaseAdapter');
const inMemoryDatabase = require('./inMemoryDatabase');

const useRealDatabase = true;

async function storeNewGame(gameId, game) {
    if (useRealDatabase) {
        await databaseAdapter.storeNewGame(gameId, game);
    }

    inMemoryDatabase.storeNewGame(gameId, game);
}

async function findGameWithPlayerId(playerId) {
    var result = null;
    if (useRealDatabase) {
        result = await databaseAdapter.findGameWithPlayerId(playerId);
    }

    if (result != null) {
        return result;
    }

    return inMemoryDatabase.findGameWithPlayerId(playerId);
}

async function getGame(gameId) {
    var result = null;
    if (useRealDatabase) {
        result = await databaseAdapter.getGame(gameId);
    }

    if (result != null) {
        return result;
    }

    return inMemoryDatabase.getGame(gameId);
}

async function updateGame(gameId, game, playersChanged) {
    if (useRealDatabase) {
        await databaseAdapter.updateGame(gameId, game, playersChanged);
    }

    inMemoryDatabase.updateGame(gameId, game, playersChanged);
}

async function deleteGame(game) {
    if (useRealDatabase) {
        await databaseAdapter.deleteGame(game);
    }

    inMemoryDatabase.deleteGame(game);
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