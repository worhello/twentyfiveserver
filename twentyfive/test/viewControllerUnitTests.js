"use strict";

let viewController = require('../viewController.js');

let assert = require('assert');

describe('viewControllerUnitTests.getCurrentCardSideClassName', function() {
    var getCurrentCardSideClassName = viewController.getCurrentCardSideClassName;
    describe('2 players', function() {
        let numPlayer = 2;
        it('should return correct results for 2 players', function() {
            let actual = getCurrentCardSideClassName(1, numPlayer);
            assert.strictEqual(actual, "PlayedCardContainer_Center");

            actual = getCurrentCardSideClassName(2, numPlayer);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
        });
    });

    describe('3 players', function() {
        let numPlayers = 3;
        it('should return correct results for 3 players', function() {
            let actual = getCurrentCardSideClassName(1, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
            actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('4 players', function() {
        let numPlayers = 4;
        it('should return correct results for 4 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('5 players', function() {
        let numPlayers = 5;
        it('should return correct results for 5 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('6 players', function() {
        let numPlayers = 6;
        it('should return correct results for 6 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(6, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('7 players', function() {
        let numPlayers = 7;
        it('should return correct results for 7 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(6, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(7, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('8 players', function() {
        let numPlayers = 8;
        it('should return correct results for 8 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
            actual = getCurrentCardSideClassName(6, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(7, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(8, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('9 players', function() {
        let numPlayers = 9;
        it('should return correct results for 9 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(6, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(7, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(8, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(9, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });

    describe('10 players', function() {
        let numPlayers = 10;
        it('should return correct results for 10 players', function() {
            let actual = getCurrentCardSideClassName(2, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(3, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(4, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(5, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Left");
            actual = getCurrentCardSideClassName(6, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Center");
            actual = getCurrentCardSideClassName(7, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(8, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(9, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
            actual = getCurrentCardSideClassName(10, numPlayers);
            assert.strictEqual(actual, "PlayedCardContainer_Right");
        });
    });
});
