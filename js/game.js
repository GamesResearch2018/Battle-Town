//Variables

var myId = 0;

var map;
var walls;
var walls2;
var test2;

var localPlayerSprite;
var localPlayer;
var playersList = {};

var ready = false;
var eurecaServer;

var keys;
var handgunshot;
var shotgunshot;
var rifleshot;
var rocketlaunch;
var getshield;

var explosions, bigExplosion;

//Update player list
function updatePlayerState(id, state) {
	if (!playersList[id] || !playersList[id].alive) return;
	if (playersList[id] && id != myId) {

		playersList[id].cursor = state;
		playersList[id].playerSprite.x = state.x;
		playersList[id].playerSprite.y = state.y;
		playersList[id].playerSprite.angle = state.angle;
		playersList[id].playerSprite.rotation = state.rot;

		playersList[id].update();
	}
}

//Update pick ups
function updatePickUps(newPickUps) {
	newPickUps.forEach(function(pu, idx) {
		var pickUpSprite = game.pickUps.children[idx];
		pickUpSprite.reset(pu[0][0], pu[0][1]);
		pickUpSprite.type = pu[1];
		pickUpSprite.play(pu[1]);
	});
}

//Update health bars
function updatePlayerHealth(playerShotandShooter, allNames) {
	var victim = playerShotandShooter.playerShot;
	var shooter = playerShotandShooter.shooter;
	var bullet = playerShotandShooter.type;
	if (playersList[victim].shield.health > 0) {
		if (bullet === 'rocket') {
			playersList[victim].shield.kill();
			playersList[victim].cursor.shield = false;
			return;
		}

		playersList[victim].shield.health--;
		if (playersList[victim].shield.health <= 0) {
			playersList[victim].shield.kill();
			playersList[victim].cursor.shield = false;
		}
	}
	else {
		if (bullet === 'bullet') {
			playersList[victim].cursor.health--;
			playersList[victim].cursor.shield = false;
		}
		if (bullet === 'rocket' || playersList[victim].cursor.health <= 0) {
			playersList[victim].shield.kill();
			playersList[victim].healthbar.kill();
			playersList[victim].label.kill();
			playersList[victim].playerSprite.kill();
			playersList[victim].cursor.alive = false;
			playersList[victim].cursor.exists = false;
			playersList[victim].cursor.visible = false;
			playersList[victim].cursor.shield = false;
			for (var each in playersList) {
				if ((playersList[each].playerSprite.id === victim) && (victim === myId)) {
					eurecaServer.killUpdate({
						killer: shooter,
						victim: victim
					})
				}
			}
			setTimeout(function() {
				var loc = playerSpawns[randomize(playerSpawns)];
				playersList[victim].playerSprite.x = loc[0];
				playersList[victim].playerSprite.y = loc[1];
				playersList[victim].playerSprite.revive();
				playersList[victim].label.revive();
				playersList[victim].healthbar.revive();

				playersList[victim].cursor.alive = true;
				playersList[victim].cursor.exists = true;
				playersList[victim].cursor.visible = true;
				playersList[victim].cursor.health = 10;
				playersList[victim].cursor.skin = 'handgun';
			}, 5000);
		}
	}
}


//Server communication
var eurecaClientSetup = function() {
	//Creates instance of eureca.io
	var eurecaClient = new Eureca.Client();

	eurecaClient.ready(function(proxy) {
		eurecaServer = proxy;
	});
	
	//Exports client information
	eurecaClient.exports.nameChange = function(id, name, allNames) {
		for (var player in playersList) {
			playersList[id].label.destroy();
			playersList[id].label = game.add.text(playersList[id].playerSprite.x, playersList[id].playerSprite.y, '' + name + '', {
				font: "14px Arial",
				fill: "#ffffff",
				align: "center"
			});
			playersList[id].displayName = name;
			playersList[id].label.anchor.setTo(.5, -1.7);
			playersList[id].playerSprite.bringToTop();
		}

		for (var player in playersList) {
			allNames.forEach(function(playerName) {
				if (playersList[player].playerSprite.id === playerName.id) {
					playersList[player].displayName = playerName.name;
					playersList[player].label.destroy();
					playersList[player].label = game.add.text(playersList[player].playerSprite.x, playersList[player].playerSprite.y, '' + playersList[player].displayName + '', {
						font: "14px Arial",
						fill: "#ffffff",
						align: "center"
					});
					playersList[player].label.anchor.setTo(.5, -1.7);
				}
			})
		}
	};

	//Creates game and loads in pickups	
	eurecaClient.exports.setInfo = function(info) {
			myId = info.id;
			create();
			updatePickUps(info.pickUps);
			eurecaServer.handshake(myId);
			ready = true;
		}
		
	//Removes player on disconnect
	eurecaClient.exports.kill = function(id) {
		if (playersList[id]) {
			playersList[id].destroy();
			console.log('Removing ', id, playersList[id], " from the game");
		}
	};

	//Print kill text
	eurecaClient.exports.printKillText = function(obj, allNames) {
		var yofKillText = 0
		if (game.time.now - timeNow <= 2000) {
			yofKillText = 100
		}
		var timeNow = game.time.now
		if (timeNow <= game.time.now) {}
		var killer;
		var victim;

		allNames.forEach(function(each) {
			if (obj.killer === each.id) {
				killer = each.name
			}
			else if (obj.victim === each.id) {
				victim = each.name
			}
		});

		for (var i in playersList) {
			if ((playersList[i].playerSprite.id === obj.victim) && (obj.victim === myId)) {
				var t = game.add.text(0, yofKillText, "Killed by " + killer, {
					font: "20px Arial",
					fill: "#ffffff",
					align: "center"
				});
				t.fixedToCamera = true;
				t.lifespan = 2000;
			}

			if (playersList[i].playerSprite.id === obj.killer && obj.killer === myId) {
				var t = game.add.text(0, 0, "You killed " + victim, {
					font: "20px Arial",
					fill: "#ffffff",
					align: "center"
				});
				t.fixedToCamera = true;
				t.lifespan = 2000;
			}
		}
	}
	
	//Scoreboard handler
	eurecaClient.exports.displayScoreboard = function(res, id) {
		if (id === myId) {
			var style = {
				font: "40px Arial",
				fill: "#0000FF",
				align: "left",
				backgroundColor: 'rgba(211,211,211,0.25)',
				tabs: [400, 120]
			}

			var kdTabs = ['Name', 'Kills', 'Deaths']
			res.unshift(kdTabs)
			var scoreboard = game.add.text(250, 150, '', style);
			scoreboard.parseList(res)
			scoreboard.fixedToCamera = true
			scoreboard.lifespan = 2000;
		}
	}

	
	//Handles pick ups and enemy players
	eurecaClient.exports.updatePickUps = updatePickUps;

	eurecaClient.exports.spawnEnemy = function(i, x, y) {
		if (i === myId) return; 
		var plyr = new Player(i, game, localPlayerSprite, x, y);
		playersList[i] = plyr;
		plyr.update();
	};

	eurecaClient.exports.updateState = updatePlayerState;
	eurecaClient.exports.removePlayerHealth = updatePlayerHealth;

	eurecaClient.exports.killPickUps = function() {
		game.pickUps.children.forEach(function(pu) {
			pu.kill()
		});
	};
};


//Starts the game
var game = new Phaser.Game(1200, 800, Phaser.AUTO, 'playDiv', {
	preload: preload,
	create: eurecaClientSetup,
	update: update,
	render: render
});

//Preload
function preload() {
	game.load.tilemap('collision', 'assets/collision.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('map', 'assets/tiles/map.json', null, Phaser.Tilemap.TILED_JSON);
	
	game.load.image('tileSet', 'assets/tiles/terrain_atlas.png');
	
	game.load.image('desert32', 'assets/desert32.png');
	game.load.image('wall', 'assets/wall.png');
	game.load.image('actuallyfloor', 'assets/actuallyfloor.png');

	game.load.spritesheet('finalplayer', 'assets/playerSprite.png', 150, 150);
	game.load.spritesheet('finalzombie', 'assets/zombieSprite.png', 150, 150);

	game.load.image('bullet', 'assets/bullet.png');
	game.load.image('rocket', 'assets/RocketRound.png');

	game.load.spritesheet('healthbar', 'assets/healthbarfinal.png', 75, 10);
	game.load.spritesheet('pickUps', 'assets/pickUps.png', 75, 75);
	game.load.spritesheet('shield', 'assets/shield.png', 130, 128);

	game.load.audio('handgunshot', 'assets/sounds/singleshot.mp3');
	game.load.audio('shotgunshot', 'assets/sounds/shotgun.mp3');
	game.load.audio('rifleshot', 'assets/sounds/AKshot.mp3');
	game.load.audio('rocketlaunch', 'assets/sounds/sfx_fly.mp3');
	game.load.audio('getshield', 'assets/sounds/shield.wav')

	game.load.spritesheet('big-explosion', 'assets/Explosion - Big.png', 96, 96, 16);
	game.load.spritesheet('small-explosion', 'assets/Explosion - Small.png', 64, 64, 16);
	
	game.stage.disableVisibilityChange = true;
}

//Create
function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	map = game.add.tilemap('map');
	map.addTilesetImage('tileSet');
	map.createLayer('ground');
	
	
	
	
	map.createLayer('detail');
	map.createLayer('detail2');
	//map.addTilesetImage('desert32', 'desert32');
	//map.addTilesetImage('wall', 'wall');
	//map.addTilesetImage('actuallyfloor', 'actuallyfloor');
	walls = map.createLayer('block');
	walls2 = map.createLayer('block2');
	map.setCollisionBetween(1, 3000, true, 'block');
	map.setCollisionBetween(1, 3000, true, 'block2');
	//map.setCollisionByExclusion([0], true, 'block');
	walls.visible = false;
	walls2.visible = false;
	
	handgunshot = game.add.audio('handgunshot');
	shotgunshot = game.add.audio('shotgunshot');
	rifleshot = game.add.audio('rifleshot');
	rocketlaunch = game.add.audio('rocketlaunch');
	getshield = game.add.audio('getshield')
	
	game.stage.backgroundColor = "#4488AA";

	walls.resizeWorld();

	map.fixedToCamera = true;

	playersList = {};

	localPlayer = new Player(myId, game, localPlayerSprite);
	playersList[myId] = localPlayer;
	localPlayerSprite = localPlayer.playerSprite;

	localPlayerSprite.bringToTop();

	game.camera.follow(localPlayerSprite);

	if (!localPlayer.displayName) {
		keys = {
			up: game.input.keyboard.addKey(Phaser.Keyboard.UP),
			down: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
			left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
			right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
			tab: game.input.keyboard.addKey(Phaser.Keyboard.TAB),
			key1: game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			key2: game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			key3: game.input.keyboard.addKey(Phaser.Keyboard.THREE),
			key4: game.input.keyboard.addKey(Phaser.Keyboard.FOUR),
			key5: game.input.keyboard.addKey(Phaser.Keyboard.FIVE),
		}
	}

	explosions = game.add.sprite(64, 64, 'small-explosion');
	explosions.kill();
	explosions.animations.add('explode');

	bigExplosion = game.add.sprite(96, 96, 'big-explosion');
	bigExplosion.kill();
	bigExplosion.animations.add('explode');

	populatePickUps();

}

//Update
function update() {
	if (!ready) return;
	//Movement
	if (localPlayer.displayName) {
		keys = {
			up: game.input.keyboard.addKey(Phaser.Keyboard.W),
			down: game.input.keyboard.addKey(Phaser.Keyboard.S),
			left: game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: game.input.keyboard.addKey(Phaser.Keyboard.D),
			tab: game.input.keyboard.addKey(Phaser.Keyboard.TAB),
			key1: game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			key2: game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			key3: game.input.keyboard.addKey(Phaser.Keyboard.THREE),
			key4: game.input.keyboard.addKey(Phaser.Keyboard.FOUR),
			key5: game.input.keyboard.addKey(Phaser.Keyboard.FIVE),
		}
	}

	game.stage.disableVisibilityChange = true;

	var input = {
		left: keys.left.isDown,
		right: keys.right.isDown,
		up: keys.up.isDown,
		down: keys.down.isDown,
		fire: game.input.activePointer.isDown,
		tx: game.input.x + game.camera.x,
		ty: game.input.y + game.camera.y
	};

	if (keys.tab.isDown) {
		eurecaServer.scoreDisplay(localPlayerSprite.id);
	}

	localPlayerSprite.rotation = game.physics.arcade.angleToPointer(localPlayerSprite);

	var inputChanged = (
		localPlayer.cursor.left != input.left ||
		localPlayer.cursor.right != input.right ||
		localPlayer.cursor.up != input.up ||
		localPlayer.cursor.down != input.down ||
		localPlayer.cursor.fire != input.fire ||
		localPlayer.cursor.rot != localPlayerSprite.rotation ||
		localPlayer.cursor.alive != localPlayerSprite.alive
	);

	if (inputChanged) {
		input.x = localPlayerSprite.x;
		input.y = localPlayerSprite.y;
		input.angle = localPlayerSprite.angle;
		input.rot = localPlayerSprite.rotation;
		input.skin = localPlayer.cursor.skin;
		input.health = localPlayer.cursor.health;
		input.shield = localPlayer.cursor.shield

		eurecaServer.handleKeys(input);
		localPlayer.cursor = input;
	}


	//Bullet collision checks
	for (var i in playersList) {
		if (!playersList[i]) continue;
		var curBullets = playersList[i].bullets;
		var curRockets = playersList[i].rockets;
		var curPlayer = playersList[i].playerSprite;
		for (var j in playersList) {
			if (!playersList[j]) continue;
			if (j != i) {
				var targetPlayer = playersList[j].playerSprite;
				game.physics.arcade.overlap(curRockets, targetPlayer, rocketHitPlayer, null, this);
				game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
			}
		}
	}	
	for (var i in playersList) {
		if (!playersList[i]) continue;
		var curBullets = playersList[i].bullets;
		var curRockets = playersList[i].rockets;
		var curPlayer = playersList[i].playerSprite;
		for (var j in playersList) {
			if (!playersList[j]) continue;
				var targetPlayer = playersList[j].playerSprite;
				game.physics.arcade.collide(curBullets, walls, bulletHitWall, null, this);
				game.physics.arcade.collide(curRockets, walls, rocketHitWall, null, this);
		}
	}
	
	
	//Updates player list
	for (var i in playersList) {
		if (playersList[i].alive) {
			playersList[i].update();
		}
	}

	game.physics.arcade.overlap(game.pickUps, localPlayerSprite, collectPickUp, null, this);
	game.physics.arcade.collide(localPlayerSprite, walls);
	game.physics.arcade.collide(localPlayerSprite, walls2);

}
//Pick up functions
function collectPickUp(player, pickUp) {
	pickUp.kill();
	if (pickUp.type === 'shotgun') {
		localPlayer.cursor.skin = 'shotgun';
		eurecaServer.handleKeys({
			skin: 'shotgun'
		});
	}
	else if (pickUp.type === 'rifle') {
		localPlayer.cursor.skin = 'rifle';
		eurecaServer.handleKeys({
			skin: 'rifle'
		});
	}
	else if (pickUp.type === 'health') {
		localPlayer.cursor.health = 10;
		eurecaServer.handleKeys({
			health: 10
		});
	}
	else if (pickUp.type === 'shield') {
		getshield.play();
		localPlayer.cursor.shield = true;
		localPlayer.shield.health = 5;
		localPlayer.shield.animations.play('shield');
		eurecaServer.handleKeys({
			shield: true
		});
	}
	else if (pickUp.type === 'two-guns') {
		localPlayer.cursor.skin = 'two-guns';
		eurecaServer.handleKeys({
			skin: 'two-guns'
		});
	}
	else if (pickUp.type === 'rocket') {
		localPlayer.cursor.skin = 'rocket';
		eurecaServer.handleKeys({
			skin: 'rocket'
		});
	}

	eurecaServer.pickupPickUp();
}


function bulletHitWall(bullet) {
	bullet.kill();

}

function rocketHitWall(rocket) {
	explosions.reset(rocket.x, rocket.y).animations.play('explode', 30, false);
	rocket.kill();

}

function bulletHitPlayer(player, bullet) {
	bullet.kill();

	if (localPlayer.playerSprite.id === player.id)
		playersList[player.id].damage(bullet);
}

function rocketHitPlayer(player, rocket) {
	bigExplosion.reset(player.x, player.y).animations.play('explode', 30, false);
	rocket.kill();

	if (localPlayer.playerSprite.id === player.id)
		playersList[player.id].damage(rocket);
}

function render() {
//game.debug.getBounds(walls);
}