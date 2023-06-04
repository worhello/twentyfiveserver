"use strict";

const { v4: uuidv4 } = require('uuid');
const GamesManager = require('../controllers/gamesManagerV2');

var connections = new Map();

function getWsForUser(userId) {
    return connections.get(userId);
}

function sendHeartbeatAck(json, callback) {
    console.log("sending heartbeat ack for userId " + json.userId);
    var ack = {};
    ack.type = "heartbeatAck";
    ack.userId = json.userId;
    callback(ack);
}

function handleWebsocketMessage(ws, message) {
    // console.log('received: %s', message);
    let sendJsonResponseToCaller = function(result) {
        // console.log("Sending: " + json);
        ws.send(JSON.stringify(result));
    }

    // TODO validate
    let json = JSON.parse(message);
    if (json.type === "heartbeat") {
        sendHeartbeatAck(json, sendJsonResponseToCaller);
    }
    else if (json.type === "createGame") {
        GamesManager.createGame(json, sendJsonResponseToCaller);
    }
    else if (json.type === "joinGame") {
        GamesManager.joinGame(json, sendJsonResponseToCaller);
    }
    else if (json.type === "requestAIs") {
        GamesManager.requestAIs(json, sendJsonResponseToCaller);
    }
    else if (json.type === "startGame") {
        GamesManager.startGame(json, sendJsonResponseToCaller);
    }
    else if (json.type === "playerAction") {
        GamesManager.playerAction(json, sendJsonResponseToCaller);
    }
}

function handleWsConnection(ws) {
    let userId = uuidv4();
    connections.set(userId, ws);
    console.log("open connection: " + userId);

    ws.on('message', function incoming(message) {
        handleWebsocketMessage(ws, message);
    });

    let finishConnectionFunc = function() {
        console.log("closing connection: " + userId);
        connections.delete(userId);
        GamesManager.handlePlayerDrop(userId);
    };
    ws.on('close', finishConnectionFunc);
    ws.on('error', finishConnectionFunc);

    ws.send(JSON.stringify({
        type: "wsConnectionAck",
        userId: userId
    }));
}

(function () {
    let e = {};
    e.handleWsConnection = handleWsConnection;

    module.exports = e;
})();