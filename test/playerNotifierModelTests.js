"use strict";

const playerNotifierModel = require('../model/playerNotifierModel');

let assert = require('assert');

describe('playerNotifierModelTests - basic flows', function() {
    it ('nothing in model - null returned', function() {
        assert.strictEqual(playerNotifierModel.getPlayerNotifiersForGame("gameId"), undefined);
    });
});