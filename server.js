"use strict";


const http = require('http');
var express = require('express');
var WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

var fs = require('fs'),
    port = process.env.PORT || 3000,
    html = fs.readFileSync('index.html');

var GamesManager = require('./app/gamesManager.js');

var app = express();

const server = http.createServer(app, function (req, res) {
    res.writeHead(200);
    res.write(html);
    res.end();
});

var connections = new Map();

function getWsForUser(userId) {
    return connections.get(userId);
}

async function handleWebsocketMessage(ws, message) {
    // console.log('received: %s', message);
    let sendJsonResponse = function(w, result) {
        let json = JSON.stringify(result);
        // console.log("Sending: " + json);
        w.send(json);
    }
    let sendJsonResponseToClient = function(userId, result) {
        let w = getWsForUser(userId);
        if (w) {
            sendJsonResponse(w, result);
        }
    };
    let sendJsonResponseToCaller = function(result) {
        sendJsonResponse(ws, result);
    }

    // TODO validate
    let json = JSON.parse(message);
    if (json.type === "createGame") {
        await GamesManager.createGame(json, sendJsonResponseToClient, sendJsonResponseToCaller);
    }
    else if (json.type === "joinGame") {
        await GamesManager.joinGame(json, sendJsonResponseToCaller);
    }
    else if (json.type === "requestAIs") {
        await GamesManager.requestAIs(json, sendJsonResponseToCaller);
    }
    else if (json.type === "startGame") {
        await GamesManager.startGame(json, sendJsonResponseToCaller);
    }
    else if (json.type === "playerAction") {
        await GamesManager.playerAction(json, sendJsonResponseToCaller);
    }
}

var eventsQueue = [];
function queueAppend(ws, message) {
    eventsQueue.push({ ws, message });
    tryRunNext();
}

let active = false;
function tryRunNext() {
    if (active || eventsQueue.length == 0) {
        return;
    }

    const { ws, message } = eventsQueue.shift();
    active = true;
    handleWebsocketMessage(ws, message)
    .then(() => {
        active = false;
        tryRunNext();
    })
    .catch((err) => {
        // handle errors
        active = false;
        tryRunNext();
    });
}

function handleWsConnection(ws) {
    let userId = uuidv4();
    connections.set(userId, ws);
    console.log("open connection: " + userId);
    ws.on('message', function incoming(message) {
        queueAppend(ws, message);
    });
    let finishConnectionFunc = function() {
        console.log("closing connection: " + userId);
        connections.delete(userId);
        GamesManager.handlePlayerDrop(userId);
    };
    ws.on('close', finishConnectionFunc);
    ws.on('error', async function(error) {
        await finishConnectionFunc();
    });

    ws.send(JSON.stringify({
        type: "wsConnectionAck",
        userId: userId
    }));
}

const wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws) {
    handleWsConnection(ws);
});

server.listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');
