"use strict";

var AWS = require("aws-sdk");

AWS.config.update({
    region: "eu-west-1",
    endpoint: "https://dynamodb.eu-west-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

const gamesTableName = "Games";
const playersToGamesTableName = "PlayersToGames";
const gameIdColumn = "gameId";
const playerIdColumn = "playerId";

// Create*Table functions are unused in production
// Here as a record of the table creation
function createGamesTable() {
    var params = {
        TableName : gamesTableName,
        KeySchema: [
            { AttributeName: gameIdColumn, KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: gameIdColumn, AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    };
    
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

function createPlayersToGamesTable() {
    var params = {
        TableName : playersToGamesTableName,
        KeySchema: [
            { AttributeName: playerIdColumn, KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: playerIdColumn, AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    };
    
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}


async function initConnection() {
}

async function storePlayerIds(game) {
    let gameId = game.id;
    var promises = [];
    for (let playerId of game.players.map(p => p.id)) {
        promises.push(storePlayerId(playerId, gameId));
    }

    for (let p of promises) {
        await p;
    }
}

async function storePlayerId(playerId, gameId) {
    console.log("Storing playerId: " + playerId + ", gameId: " + gameId);
    var params = {
        TableName: playersToGamesTableName,
        Item:{
            "playerId": playerId,
            "gameId": gameId
        }
    };

    try {
        let res = await docClient.put(params).promise();
    } catch (err) {
        console.error("Unable to store item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

async function storeNewGame(gameId, game) {
    console.log("DatabaseAdapter: store new game, id=", gameId);
    var params = {
        TableName: gamesTableName,
        Item:{
            "gameId": gameId,
            "game": JSON.stringify(game)
        }
    };

    try {
        let res = await docClient.put(params).promise();
    } catch (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

async function findGameWithPlayerId(playerId) {
    console.log("DatabaseAdapter: find game containing playerId", playerId);
    let gameId = await getGameIdForPlayerId(playerId);
    return await getGame(gameId);
}

async function getGameIdForPlayerId(playerId) {
    var params = {
        TableName: playersToGamesTableName,
        Key:{
            "playerId": playerId
        }
    };

    try {
        let res = await docClient.get(params).promise();
        return res.Item.gameId;

    } catch (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

async function getGame(gameId) {
    console.log("DatabaseAdapter: Get game, id=", gameId);
    var params = {
        TableName: gamesTableName,
        Key:{
            "gameId": gameId
        }
    };

    try {
        let res = await docClient.get(params).promise();
        return JSON.parse(res.Item.game);

    } catch (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }

    return null;
}

async function updateGame(gameId, game, playersChanged) {
    console.log("DatabaseAdapter: Update game, gameId= " + gameId);

    if (playersChanged) {
        await storePlayerIds(game);
    }

    var params = {
        TableName: gamesTableName,
        Key:{
            "gameId": gameId
        },
        UpdateExpression: "set game=:g",
        ExpressionAttributeValues:{
            ":g": JSON.stringify(game)
        },
        ReturnValues:"UPDATED_NEW"
    };

    try {
        let res = await docClient.update(params).promise();
    } catch (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

async function deletePlayerId(playerId) {
    var params = {
        TableName: playersToGamesTableName,
        Key:{
            "playerId": playerId
        }
    };

    try {
        await docClient.delete(params).promise();
    } catch (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

async function deleteGame(game) {
    console.log("DatabaseAdapter: deleting game, id= " + game.id);

    var promises = [];
    for (let playerId of game.players.map(p => p.id)) {
        promises.push(deletePlayerId(playerId));
    }

    for (let p of promises) {
        await p;
    }

    var params = {
        TableName: gamesTableName,
        Key:{
            "gameId": game.id
        }
    };

    try {
        let res = await docClient.delete(params).promise()
    } catch (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    }
}

(function () {
    let e = {};
    e.initConnection = initConnection;
    e.storeNewGame = storeNewGame;
    e.findGameWithPlayerId = findGameWithPlayerId;
    e.getGame = getGame;
    e.updateGame = updateGame;
    e.deleteGame = deleteGame;

    module.exports = e;
})();