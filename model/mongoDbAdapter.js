"use strict";

function storeNewGame(gameId, game) {
    console.log("MongoDbAdapter: storing new game, id= " + gameId + ", game= " + JSON.stringify(game));
    return null;
}

function findGameWithPlayerId(playerId) {
    console.log("MongoDbAdapter: find game with playerId= " + playerId);
    return null;
}

function getGame(gameId) {
    console.log("MongoDbAdapter: Tried to get game, id= " + gameId);
    return null;
}

function updateGame(gameId, game) {
    console.log("MongoDbAdapter: Tried to update a game, gameId= " + gameId + ", game= " + JSON.stringify(game));
    return null;
}

function deleteGame(gameId) {
    console.log("MongoDbAdapter: deleting game, id= " + gameId);
    return null;
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