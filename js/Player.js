//Spawn Points
var playerSpawns = {
1: [96, 1792],
2: [1600, 3040],
3: [3040, 1600],
4: [1440, 1440],
5: [2880, 3040],
};

function countObjectKeys(obj) { 
    return Object.keys(obj).length; 
}

function randomize (spawnObject) {
	return Math.floor((Math.random() * countObjectKeys(spawnObject)) + 1);
}

//Player Creation
function Player(index, game, user, x, y) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false,
		down: false,
		alive: true,
		visible: true,
		exists: true,
		skin: 'handgun',
		health: 10,
		shield: false
		};

    this.game = game;
    this.user = user;
    this.alive = true;
    this.nextFire = 0;
    this.cursor.health = 10;
    this.cursor.skin = 'handgun';
    this.cursor.shield = false;
   
   	var loc = playerSpawns[randomize(playerSpawns)];
    this.playerSprite = game.add.sprite(loc[0], loc[1], 'finalplayer');
    this.playerSprite.anchor.set(0.5);
    
    this.playerSprite.animations.add('move-handgun', [0], 20, false);
    this.playerSprite.animations.add('move-rifle', [4], 20, false);
    this.playerSprite.animations.add('move-shotgun', [8], 20, false);
    this.playerSprite.animations.add('move-twoguns', [12], 20, false);
    this.playerSprite.animations.add('move-rocket', [13], 20, false);
    
  	this.playerSprite.animations.add('shoot-handgun', [1, 2, 3], 7, false);
  	this.playerSprite.animations.add('shoot-rifle', [5, 6, 7], 10, false);
  	this.playerSprite.animations.add('shoot-shotgun', [9, 10, 11], 4, false);
  	this.playerSprite.animations.add('shoot-rocket', [14], 20, false);
    
    this.playerSprite.id = index;
    game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
	
    //this.playerSprite.body.setSize(75, 75, 15, 35);
	this.playerSprite.body.setSize(48, 48, 51, 51);
    this.playerSprite.body.immovable = false;
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.body.bounce.setTo(0, 0);
    this.playerSprite.angle = 0;
	
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
	
    this.bullets.createMultiple(30, 'bullet', 0, false);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('key', this.playerSprite.id);
    this.bullets.setAll('type', 'bullet');
    
    this.rockets = game.add.group();
    this.rockets.enableBody = true;
    this.rockets.physicsBodyType = Phaser.Physics.ARCADE;

    this.rockets.createMultiple(2, 'rocket', 0, false);
    this.rockets.setAll('outOfBoundsKill', true);
    this.rockets.setAll('checkWorldBounds', true);
    this.rockets.setAll('key', this.playerSprite.id);
    this.rockets.setAll('type', 'rocket');
    
    this.healthbar = game.add.sprite(x, y, 'healthbar');
  	this.healthbar.animations.add('10health', [9], 20, false);    
  	this.healthbar.animations.add('9health', [8], 20, false);    
  	this.healthbar.animations.add('8health', [7], 20, false);
  	this.healthbar.animations.add('7health', [6], 20, false);    
  	this.healthbar.animations.add('6health', [5], 20, false);
  	this.healthbar.animations.add('5health', [4], 20, false);   
  	this.healthbar.animations.add('4health', [3], 20, false);
  	this.healthbar.animations.add('3health', [2], 20, false);
  	this.healthbar.animations.add('2health', [1], 20, false);
  	this.healthbar.animations.add('1health', [0], 20, false);

    this.shield = game.add.sprite(x, y, 'shield');
    this.shield.animations.add('shield', [0, 1, 2, 3], 10, true);
    this.shield.visible = false;
    
    this.label = game.add.text(x, y, '' + this.playerSprite.id + '', { font: "14px Arial", fill: "#ffffff", align: "center" });  
    
	this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.healthbar.anchor.setTo(.5, -5.5);
    
   	this.shield.x = this.playerSprite.x;
    this.shield.y = this.playerSprite.y; 
    this.shield.anchor.setTo(0.5, 0.5);
    
	this.label.x = this.playerSprite.x;       
    this.label.y = this.playerSprite.y;       
    this.label.anchor.setTo(.5, -1.8);  
}


Player.prototype.update = function() {
	
	this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.shield.x = this.playerSprite.x;
    this.shield.y = this.playerSprite.y; 
    this.label.x = this.playerSprite.x;  
    this.label.y = this.playerSprite.y;  
	
    var speed;
    
    if (this.cursor.skin === 'handgun' || this.cursor.skin === 'two-guns') {
    	speed = 6;
    }
    else {
    	speed = 5;
    }
    
    if (this.cursor.left) {
		if (this.cursor.up) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
		else {
			this.playerSprite.body.x -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
	}
	
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
		else {
			this.playerSprite.body.x += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
		}
	}
	else if (this.cursor.up) {
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
	}
	else if (this.cursor.down) {
		this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			else if (this.cursor.skin === 'two-guns'){
				this.playerSprite.animations.play('move-twoguns')
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('move-rocket')
			}
			}
	
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('shoot-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('shoot-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('shoot-rifle');
			}
			else if (this.cursor.skin === 'rocket'){
				this.playerSprite.animations.play('shoot-rocket')
			}
	}
	
	
    if (this.cursor.health === 10){
      		this.healthbar.animations.play('10health');
    }
    else if (this.cursor.health === 9){
      		this.healthbar.animations.play('9health');
    }
    else if (this.cursor.health === 8){
      		this.healthbar.animations.play('8health');
    }
    else if (this.cursor.health === 7){
      		this.healthbar.animations.play('7health');
    }
    else if (this.cursor.health === 6){
      		this.healthbar.animations.play('6health');
    }
    else if (this.cursor.health === 5){
      		this.healthbar.animations.play('5health');
    }
    else if (this.cursor.health === 4){
      		this.healthbar.animations.play('4health');
    }
    else if (this.cursor.health === 3){
      		this.healthbar.animations.play('3health');
    }
    else if (this.cursor.health === 2){
      		this.healthbar.animations.play('2health');
    }
    else if (this.cursor.health === 1){
      		this.healthbar.animations.play('1health');
    }
    
    if (this.cursor.shield === true) {
    	this.shield.visible = true;
    	this.shield.animations.play('shield');
    }
    if (this.cursor.shield === false) {
    	this.shield.visible = false;
    }
  
};

Player.prototype.fire = function(target) {
		if (!this.playerSprite.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            var bullet = this.bullets.getRandom();
            var bullet2 = this.bullets.getRandom();
			var bullet3 = this.bullets.getRandom();
			var rocket = this.rockets.getRandom();
            
            if (this.cursor.skin === 'handgun') {
            	this.fireRate = 500;
            	this.nextFire = this.game.time.now + this.fireRate;
     			this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.7);
				
				bullet.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation; 	
				bullet.body.tilePadding.x = 3000
				bullet.body.tilePadding.y = 3000				
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 
				
				handgunshot.play();
			}
			if (this.cursor.skin === 'shotgun') {
				this.fireRate = 800;
				this.nextFire = this.game.time.now + this.fireRate;
				this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.4);
				bullet.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet2.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet3.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;   
				bullet2.rotation = this.playerSprite.rotation;    
				bullet3.rotation = this.playerSprite.rotation;    
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation +0.1, 1200, bullet2.body.velocity); 
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation -0.1, 1200, bullet3.body.velocity); 
	            shotgunshot.play();
			}
			if (this.cursor.skin === 'rifle') {
				this.fireRate = 200;
				this.nextFire = this.game.time.now + this.fireRate;
				this.bullets.setAll('anchor.x', 0.5);
				this.bullets.setAll('anchor.y', -0.4);
				bullet.reset((this.playerSprite.x + (73*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (73*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity);
	            rifleshot.play();
			}
			if (this.cursor.skin === 'two-guns') {
				this.fireRate = 400;
				this.nextFire = this.game.time.now + this.fireRate;
				bullet.anchor.x = 0;
				bullet.anchor.y = -0.6;
				bullet2.anchor.x = 0;
				bullet2.anchor.y = 1;
				bullet.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet2.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
				bullet2.rotation = this.playerSprite.rotation;  
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity);
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet2.body.velocity);
	            handgunshot.play();
	            handgunshot.play();
			}
			if (this.cursor.skin === 'rocket') {
				this.fireRate = 1000;
				this.nextFire = this.game.time.now + this.fireRate;
				rocket.anchor.x = -0.2;
				rocket.anchor.y = -0.8;
				rocket.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				rocket.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 600, rocket.body.velocity);
	            rocketlaunch.play();
			}
        }
};    
      
Player.prototype.damage = function(bullet){
	eurecaServer.bulletHitsPlayer({
	playerShot: this.playerSprite.id,
	shooter: bullet.key,
	type: bullet.type
	});
};

Player.prototype.destroy = function() {
	console.log("Destroying ", this);
	this.playerSprite.destroy();
	this.healthbar.destroy();
	this.label.destroy();
	this.shield.destroy();
};