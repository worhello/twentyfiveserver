"use strict";

const databaseAdapter = require('./databaseAdapter');
const inMemoryDatabase = require('./inMemoryDatabase');

const useRealDatabase = true;

async function storeNewGame(gameId, game) {
    if (useRealDatabase) {
        await databaseAdapter.storeNewGame(gameId, game);
    }
    else {
        inMemoryDatabase.storeNewGame(gameId, game);
    }
}

async function findGameWithPlayerId(playerId) {
    if (useRealDatabase) {
        return await databaseAdapter.findGameWithPlayerId(playerId);
    }
    else {
        return inMemoryDatabase.findGameWithPlayerId(playerId);
    }
}

async function getGame(gameId) {
    if (useRealDatabase) {
        return await databaseAdapter.getGame(gameId);
    }
    else {
        return inMemoryDatabase.getGame(gameId);
    }
}

async function updateGame(gameId, game) {
    if (useRealDatabase) {
        await databaseAdapter.updateGame(gameId, game);
    }
    else {
        inMemoryDatabase.updateGame(gameId, game);
    }
}

async function deleteGame(game) {
    if (useRealDatabase) {
        await databaseAdapter.deleteGame(game);
    }
    else {
        inMemoryDatabase.deleteGame(game);
    }
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