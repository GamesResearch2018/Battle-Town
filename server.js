//Zombie Tower Server
var express = require('express'),
app = express(app),
server = require('http').createServer(app);
app.use(express.static(__dirname));

//Variables
var clients = {};
var updatedPicks = [];
var totalKills = [];
var allNames = [];
pickUpUpdate();

var Eureca = require('eureca.io');
var eurecaServer = new Eureca.Server({
    allow: ['killPickUps', 'setInfo', 'spawnEnemy', 'kill', 'updateState', 'updatePickUps',
        'nameChange', 'removePlayerHealth', 'displayScoreboard', 'printKillText'
    ]
});

eurecaServer.attach(server);

//server.listen(process.env.PORT);
server.listen(2000);

//Listens for client connection and adds player to list
eurecaServer.onConnect(function(conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
	
    var remote = eurecaServer.getClient(conn.id);

    clients[conn.id] = {
        id: conn.id,
        remote: remote
    };

    remote.setInfo({
        id: conn.id,
        pickUps: updatedPicks
    });

});

//Listens for client disconnection and removes player from list
eurecaServer.onDisconnect(function(conn) {
    console.log('Client disconnected ', conn.id);
    var removeId = clients[conn.id].id;
    delete clients[conn.id];

    var index;
    allNames.forEach(function(each, i) {
        if (each.id === conn.id) {
            index = i
        }
    })
    allNames.splice(index, 1);

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.kill(conn.id);
    }
});

//Listens and sends player positions
eurecaServer.exports.handshake = function(connId) {
    var remote = clients[connId].remote;

    for (var cc in clients) {

        if (cc === connId) {
            continue;
        }
        var x = clients[cc].laststate ? clients[cc].laststate.x : 0;
        var y = clients[cc].laststate ? clients[cc].laststate.y : 0;

        remote.spawnEnemy(clients[cc].id, x, y);

        clients[cc].remote.spawnEnemy(connId, 0, 0);
    }
};

//Spawns Random Pick Ups
function pickUpUpdate() {
    var locs = [
        [1056, 1408],
        [2560, 2048],
        [2048, 2368],
        [224, 608],
        [320, 2368],
        [2976, 992],
        [1856, 2272],
        [1184, 2016],
        [1408, 448],
        [2272, 1248],
        [2112, 160],
        [192, 1408]
    ];
    var pickUpType = ['rifle', 'shotgun', 'health', 'shield', 'two-guns', 'rocket'];
    updatedPicks = [];
    for (var i = 0; i < 5; i++) {
        var pu = updatedPicks[i] = [
            locs.splice(Math.floor(locs.length * Math.random()), 1)[0],
            pickUpType[Math.floor(pickUpType.length * Math.random())]
        ];
    }

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.updatePickUps(updatedPicks);
    }
}

eurecaServer.exports.assignName = function(id, name) {
    allNames.push({
        id, name
    });
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.nameChange(id, name, allNames);
    }
}


eurecaServer.exports.bulletHitsPlayer = function(playerShotandShooter) {
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.removePlayerHealth(playerShotandShooter);
    }
}

eurecaServer.exports.pickupPickUp = function() {
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.killPickUps();
    }
    setTimeout(function() {
        pickUpUpdate();
    }, 3000);
};

eurecaServer.exports.killUpdate = function(packge) {
    totalKills.push(packge)
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.printKillText(packge, allNames);
    }
}

eurecaServer.exports.scoreDisplay = function(id) { 
    if (totalKills.length === 0) return;
    var fullKDcount = []

    allNames.forEach(function(namePair) {
        var kdPair = []
        var player = namePair.name;
        var killCount = 0;
        var deathCount = 0;
        totalKills.forEach(function(killEvent) {

            if (namePair.id === killEvent.killer) {
                killCount += 1
            }
            if (namePair.id === killEvent.victim) {
                deathCount += 1
            }
        })
        kdPair[0] = player;
        kdPair[1] = killCount;
        kdPair[2] = deathCount;
        fullKDcount.push(kdPair);

    })

    var useableName;

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.displayScoreboard(fullKDcount, id);
    }
}


eurecaServer.exports.handleKeys = function(keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;

        remote.updateState(updatedClient.id, keys);

        clients[c].laststate = keys;
    }
};