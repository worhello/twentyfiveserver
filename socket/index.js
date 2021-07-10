"use strict";

const WebSocket = require('ws');
const GameStateMachineSocketHandler = require('./gameStateMachineSocketHandler');

var wss;

function handleWssServerConnection(ws) {
    GameStateMachineSocketHandler.handleWsConnection(ws);
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