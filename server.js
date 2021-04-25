"use strict";


const http = require('http');
var express = require('express');
var WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

var GamesManager = require('./gamesManager.js');
// const result = require('./result.js');
// const jsonValidator = require('./jsonValidator.js');

var app = express();
// app.use(express.static('public')); // TODO check if needed

const server = http.createServer(app);

var connections = [];

function getWsForUser(userId) {
    let i = connections.findIndex(function(conn) { return conn.id === userId });
    if (i > -1) {
        return connections[i].connection;
    }
    return null;
}

function handleWebsocketMessage(ws, message) {
    //console.log('received: %s', message);
    let sendJsonResponse = function(w, result) {
        let json = JSON.stringify(result);
        //console.log("Sending: " + json);
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
        GamesManager.createGame(json, sendJsonResponseToClient, sendJsonResponseToCaller);
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
    connections.push({
        id: userId,
        connection: ws
    });
    ws.on('message', function incoming(message) {
        handleWebsocketMessage(ws, message);
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

server.listen(8081);
