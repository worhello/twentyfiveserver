"use strict";

const WebSocket = require('ws');
const GameProcessorSocketHandler = require('./gameProcessorSocketHandler');
const GameStateMachineSocketHandler = require('./gameStateMachineSocketHandler');

var wss;

// enabling this - will remove whole check soon
const useGameStateMachine = true;

function handleWssServerConnection(ws) {
    if (useGameStateMachine) {
        GameStateMachineSocketHandler.handleWsConnection(ws);
    }
    else {
        GameProcessorSocketHandler.handleWsConnection(ws);
    }
}

function init(server) {
    wss = new WebSocket.Server({ server: server });
    wss.on('connection', handleWssServerConnection);
}


(function () {
    let e = {};
    e.init = init;

    module.exports = e;
})();