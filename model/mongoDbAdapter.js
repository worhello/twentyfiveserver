"use strict";

async function storeNewGame(gameId, game) {
    console.log("MongoDbAdapter: storing new game, id= " + gameId + ", game= " + JSON.stringify(game));
}

async function findGameWithPlayerId(playerId) {
    console.log("MongoDbAdapter: find game with playerId= " + playerId);
    return null;
}

async function getGame(gameId) {
    console.log("MongoDbAdapter: Tried to get game, id= " + gameId);
    return null;
}

async function updateGame(gameId, game) {
    console.log("MongoDbAdapter: Tried to update a game, gameId= " + gameId + ", game= " + JSON.stringify(game));
}

async function deleteGame(gameId) {
    console.log("MongoDbAdapter: deleting game, id= " + gameId);
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