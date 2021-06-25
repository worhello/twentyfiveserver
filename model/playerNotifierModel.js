"use strict";

var currentConnections = new Map();

function addPlayerNotifier(gameId, playerId, notifyPlayerFunc) {
    let gameNotifiers = getOrCreatePlayerNotifiersForGame(gameId);
    gameNotifiers.set(playerId, notifyPlayerFunc);
}

function removePlayerNotifier(gameId, playerId) {
    let gameNotifiers = getPlayerNotifiersForGame(gameId);
    gameNotifiers.delete(playerId);
}

function getPlayerNotifiersForGame(gameId) {
    return currentConnections.get(gameId);
}

function getPlayerNotifierForGame(gameId, playerId) {
    let gameNotifiers = getPlayerNotifiersForGame(gameId);
    if (gameNotifiers) {
        return gameNotifiers.get(playerId);
    }
    return null;
}

function deleteGameNotifiers(gameId) {
    let gameNotifiers = getPlayerNotifiersForGame(gameId);
    if (gameNotifiers) {
        gameNotifiers.clear();
        currentConnections.delete(gameId);
    }
}

function getOrCreatePlayerNotifiersForGame(gameId) {
    let gameNotifiers = getPlayerNotifiersForGame(gameId);
    if (!gameNotifiers) {
        currentConnections.set(gameId, new Map());
    }

    return getPlayerNotifiersForGame(gameId);
}

(function () {
    let e = {};
    e.addPlayerNotifier = addPlayerNotifier;
    e.removePlayerNotifier = removePlayerNotifier;
    e.getPlayerNotifiersForGame = getPlayerNotifiersForGame;
    e.getPlayerNotifierForGame = getPlayerNotifierForGame;
    e.deleteGameNotifiers = deleteGameNotifiers;
    
    module.exports = e;
})();