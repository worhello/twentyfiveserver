"use strict";

const playerNotifierModel = require('../model/playerNotifierModel');

let assert = require('assert');

describe('playerNotifierModelTests - basic flows', function() {
    let gameId = "gameId";
    beforeEach(function() {
        playerNotifierModel.deleteGameNotifiers(gameId);
        assert.strictEqual(playerNotifierModel.getPlayerNotifiersForGame(gameId), undefined);
    })
    it ('nothing in model - null returned', function() {
        assert.strictEqual(playerNotifierModel.getPlayerNotifiersForGame(gameId), undefined);
    });
});