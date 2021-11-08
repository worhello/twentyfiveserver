"use strict";

const jsonValidator = require('../helpers/jsonValidator.js');

function validateJson(json, validFields, objectName, result) {
    let validator = jsonValidator.buildValidatorWithJson(objectName, json, validFields);
    validator.validate(result);
}

function checkPlayerDetails(playerDetails, result) {
    validateJson(playerDetails, ["name", "userId"], "playerDetails", result);
}

function checkCreateGameJson(json, result) {
    validateJson(json, ["type", "numberOfPlayers", "playerDetails", "gameRules"], "request", result);
    if (result.success == true) {
        checkPlayerDetails(json.playerDetails, result);
    }
}

function checkJoinGameJson(json, result) {
    validateJson(json, ["type", "gameId", "playerDetails"], "request", result);
    if (result.success == true) {
        checkPlayerDetails(json.playerDetails, result);
    }
}

function checkRequestAIsJson(json, result) {
    validateJson(json, ["type", "gameId"], "request", result);
}

function checkStartGameJson(json, result) {
    validateJson(json, ["type", "gameId"], "request", result);
}

function checkPlayerActionJson(json, result) {
    if (!("playerActionType" in json)) {
        result.errorMessage = "playerActionType property must be present in payload"
        return;
    }

    var gameFields = ["type", "gameId", "userId", "playerActionType"];
    if (json.playerActionType === "playCard") {
        gameFields.push("cardDetails");
    }
    else if (json.playerActionType === "robTrumpCard") {
        gameFields.push("droppedCardDetails");
    }
    validateJson(json, gameFields, "request", result);
}

(function () {
    let e = {};
    e.checkCreateGameJson = checkCreateGameJson;
    e.checkJoinGameJson = checkJoinGameJson;
    e.checkRequestAIsJson = checkRequestAIsJson;
    e.checkStartGameJson = checkStartGameJson;
    e.checkPlayerActionJson = checkPlayerActionJson;
    
    module.exports = e;
})();