"use strict";

const playerNotifierModel = require('../model/playerNotifierModel');

function notifyOneFromModel(modelNotifierFunc, data) {
    modelNotifierFunc(data);
}

function notifyOne(gameId, playerId, data) {
    let notifier = playerNotifierModel.getPlayerNotifierForGame(gameId, playerId);
    if (notifier) {
        notifyOneFromModel(notifier, data);
    }
}

function notifyAll(gameId, data) {
    let playerNotifiers = playerNotifierModel.getPlayerNotifiersForGame(gameId);
    if (!playerNotifiers) {
        // log error?
        return;
    }

    playerNotifiers.forEach(function (v, k, map) {
        notifyOneFromModel(v, data);
    });
}

function notifyAllGameInitialState(game) {
    var data = {
        type: "gameInitialState",
        gameId: game.id,
        gameInfo: {
            trumpCard: game.trumpCard
        },
        playerDetails: {
            userId: "",
            cards: []
        },
        players: game.players,
        teams: game.teams
    }
    for (var i = 0; i < game.players.length; i++) {
        let p = game.players[i];
        if (p.isAi == false) {
            data.playerDetails.userId = p.id;
            data.playerDetails.cards = p.cards;
            notifyOne(game.id, p.id, data);
        }
    }
}

function notifyPlayersListChanged(game, needsMorePlayers) {
    let data = {
        type: "playerListChanged",
        gameId: game.id,
        playersDetails: game.players,
        needMorePlayers: needsMorePlayers
    }
    notifyAll(game.id, data);
}

function notifyOnePlayerRobTrumpCardAvailable(game, playerCanRob) {
    let data = {
        type: "robTrumpCardAvailable",
        userId: playerCanRob.id,
        trumpCard: game.trumpCard
    }
    notifyOne(game.id, playerCanRob.id, data);
}

function notifyAllGameError(game, errorMessage) {
    let data = {
        type: "gameError",
        errorMessage: errorMessage
    };
    notifyAll(game.id, data);
}

function notifyAllCurrentPlayerMovePending(game, player) {
    let data = {
        type: "currentPlayerMovePending",
        gameId: game.id,
        userId: player.id
    }
    notifyAll(game.id, data);
}

function notifyOnePlayerMoveRequested(game, player) {
    let data = {
        type: "playerMoveRequested",
        gameId: game.id,
        userId: player.id
    }
    notifyOne(game.id, player.id, data);
}

function notifyAllCardPlayed(game, player, playedCard, isNewWinningCard) {
    let data = {
        type: "cardPlayed",
        gameId: game.id,
        userId: player.id,
        playedCard: playedCard,
        isNewWinningCard: isNewWinningCard
    }
    notifyAll(game.id, data);
}

function notifyOneCardsUpdated(game, player) {
    let data = {
        type: "cardsUpdated",
        gameId: game.id,
        userId: player.id,
        cards: player.cards
    }
    notifyOne(game.id, player.id, data);
}

function notifyAllRoundFinished(game, eventType) {
    let data = {
        type: eventType,
        gameId: game.id,
        orderedPlayers: game.endOfHandInfo.orderedPlayers,
        teams: game.teams
    }
    notifyAll(game.id, data);
}

function notifyAllPlayerReadyForNextRoundChanged(game, readyPlayerIds) {
    let data = {
        type: "playersReadyForNextRoundChanged",
        readyPlayerIds: readyPlayerIds
    }
    notifyAll(game.id, data);
}

(function () {
    let e = {};
    e.notifyAllGameInitialState = notifyAllGameInitialState;
    e.notifyPlayersListChanged = notifyPlayersListChanged;
    e.notifyOnePlayerRobTrumpCardAvailable = notifyOnePlayerRobTrumpCardAvailable;
    e.notifyAllGameError = notifyAllGameError;
    e.notifyAllCurrentPlayerMovePending = notifyAllCurrentPlayerMovePending;
    e.notifyOnePlayerMoveRequested = notifyOnePlayerMoveRequested;
    e.notifyAllCardPlayed = notifyAllCardPlayed;
    e.notifyOneCardsUpdated = notifyOneCardsUpdated;
    e.notifyAllRoundFinished = notifyAllRoundFinished;
    e.notifyAllPlayerReadyForNextRoundChanged = notifyAllPlayerReadyForNextRoundChanged;

    module.exports = e;
})();