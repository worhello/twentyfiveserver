"use strict";


const http = require('http');
const express = require('express');
const socket = require('./socket');

var fs = require('fs'),
    port = process.env.PORT || 3000,
    html = fs.readFileSync('index.html');

var app = express();

const server = http.createServer(app, function (req, res) {
    res.writeHead(200);
    res.write(html);
    res.end();
});

socket.init(server);

server.listen(port);
console.log('Server running, port: ' + port);
