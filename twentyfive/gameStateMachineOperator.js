"use strict";

const tf = require('twentyfive');
const gameModel = require('../model/gameModel');
const notificationHelper = require('./notificationHelper');

async function updateGameInModel(game, playersChanged) {
    await gameModel.updateGame(game.id, game, playersChanged);
}

function updateGameState(game, playersChanged) {
    tf.GameStateMachine.updateToNextGameState(game);
    handleUpdatedGameState(game, playersChanged);
}

function handleUpdatedGameState(game, playersChanged) {
    updateGameInModel(game, playersChanged).then(() => handleUpdateGameStateAfterPersistence(game));
}

function handleUpdateGameStateAfterPersistence(game) {
    if (game.currentState2 == tf.GameState2.waitingForPlayers) {
        handleWaitingForPlayer(game);
    }
    else if (game.currentState2 == tf.GameState2.readyToPlay) {
        handleReadyToPlay(game);
    }
    else if (game.currentState2 == tf.GameState2.dealCards) {
        handleDealCards(game);
    }
    else if (game.currentState2 == tf.GameState2.cardsDealt) {
        handleCardsDealt(game);
    }
    else if (game.currentState2 == tf.GameState2.waitingForPlayerToRobTrumpCard) {
        handleWaitingForPlayerToRobTrumpCard(game);
    }
    else if (game.currentState2 == tf.GameState2.waitingForPlayerMove) {
        handleWaitingForPlayerMove(game);
    }
    else if (game.currentState2 == tf.GameState2.roundFinished) {
        handleRoundFinished(game);
    }
    else if (game.currentState2 == tf.GameState2.waitingForPlayersToMarkAsReady) {
        handleWaitingForPlayersToMarkAsReady(game);
    }
    else if (game.currentState2 == tf.GameState2.gameFinished) {
        handleGameFinished(game)
    }
}

function handleWaitingForPlayer(game) {
    notificationHelper.notifyPlayersListChanged(game, true);
}

function handleReadyToPlay(game) {
    notificationHelper.notifyPlayersListChanged(game, false);
}

function handleDealCards(game) {
    updateGameState(game);
}

function handleCardsDealt(game) {
    updateGameState(game);
}

function notifyInitialStateIfNeeded(game) {
    if (game.currentHandInfo.roundPlayerAndCards.length == 0) {
        notificationHelper.notifyAllGameInitialState(game);
    }
}

function handleWaitingForPlayerToRobTrumpCard(game) {
    notifyInitialStateIfNeeded(game);
    let player = game.players[game.roundRobbingInfo.playerCanRobIndex];
    if (player.isAi == false) {
        notificationHelper.notifyOnePlayerRobTrumpCardAvailable(game, player);
    }
    else {
        tf.GameStateMachine.handleAiPlayerRob(game);
        updateGameState(game);
    }
}

function notifyAfterCardPlayed(game, isNewWinningCard) {
    let move = game.currentHandInfo.roundPlayerAndCards[game.currentHandInfo.roundPlayerAndCards.length - 1];
    notificationHelper.notifyAllCardPlayed(game, move.player, move.card, isNewWinningCard);
}

function handleWaitingForPlayerMove(game) {
    notifyInitialStateIfNeeded(game);

    let player = game.players[game.currentHandInfo.currentPlayerIndex];

    notificationHelper.notifyAllCurrentPlayerMovePending(game, player)

    if (player.isAi == false) {
        notificationHelper.notifyOnePlayerMoveRequested(game, player);
    }
    else {
        let isNewWinningCard = tf.GameStateMachine.aiPlayCard(game, player);
        notifyAfterCardPlayed(game, isNewWinningCard);
        updateGameState(game);
    }
}

function handleRoundFinished(game) {
    if (game.currentHandInfo.needMoreCardsDealt) {
        notificationHelper.notifyAllRoundFinished(game, "roundFinished");
    }
    else {
        notificationHelper.notifyAllRoundFinished(game, "scoresUpdated");
    }
    updateGameState(game);
}

function handleGameFinished(game) {
    notificationHelper.notifyAllRoundFinished(game, "gameFinished");
    gameModel.deleteGame(game).then(() => {
        console.log("Deleted game: ", game.id);
    });
}

function initGame(game) {
    updateGameState(game);
}

function addPlayer(game, player) {
    tf.GameStateMachine.addPlayer(game, player);
    updateGameState(game, true);
}

function removePlayer(game, playerId) {
    tf.GameStateMachine.removePlayer(game, playerId);
    updateGameState(game, true);
}

function fillWithAis(game) {
    tf.GameStateMachine.fillWithAIs(game);
    updateGameState(game, true);
}

function startGame(game) {
    if (game.currentState2 == tf.GameState2.readyToPlay) {
        updateGameState(game);
    }
}

function playCardWithId(game, userId, cardDetails) {
    let player = game.players.find((p) => p.id == userId); // error validation???
    let isNewWinningCard = tf.GameStateMachine.playCard(game, player, cardDetails.cardName);
    notificationHelper.notifyOneCardsUpdated(game, game.players.find((p) => p.id == userId));
    notifyAfterCardPlayed(game, isNewWinningCard);
    updateGameState(game);
}

function robTrumpCard(game, userId, droppedCardDetails) {
    let player = game.players.find((p) => p.id == userId);
    if (player) {
        // check cardName is valid?
        tf.GameStateMachine.robCard(game, player, droppedCardDetails.cardName);
        notificationHelper.notifyOneCardsUpdated(game, game.players.find((p) => p.id == userId));
    }
    else {
        // log error
        tf.GameStateMachine.skipRobbing(game);
    }
    updateGameState(game);
}

function skipRobTrumpCard(game, userId) {
    let player = game.players.find((p) => p.id == userId);
    if (!player) {
        // log error?
    }

    tf.GameStateMachine.skipRobbing(game);
    updateGameState(game);
}

function markPlayerReadyForNextRound(game, playerId) {
    tf.GameStateMachine.markPlayerReadyForNextRound(game, playerId);
    updateGameState(game);

    if (game.currentState2 == tf.GameState2.dealCards) {
        updateGameState(game);
    }
}

function handleWaitingForPlayersToMarkAsReady(game) {
    let readyPlayerIds = game.players.filter((p) => p.isReadyForNextRound == true).map((p) => p.id);
    notificationHelper.notifyAllPlayerReadyForNextRoundChanged(game, readyPlayerIds);
}


(function () {
    let e = {};
    e.initGame = initGame;
    e.addPlayer = addPlayer;
    e.removePlayer = removePlayer;
    e.fillWithAis = fillWithAis;
    e.startGame = startGame;
    e.playCardWithId = playCardWithId;
    e.robTrumpCard = robTrumpCard;
    e.skipRobTrumpCard = skipRobTrumpCard;
    e.markPlayerReadyForNextRound = markPlayerReadyForNextRound;

    module.exports = e;
})();