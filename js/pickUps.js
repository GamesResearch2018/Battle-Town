//Pick up handler
	function populatePickUps() {
	
	    this.game.pickUps = this.game.add.group();
	    this.game.pickUps.enableBody = true;
	    this.game.pickUps.physicsBodyType = Phaser.Physics.ARCADE;
		this.game.pickUps.createMultiple(5, 'pickUps', 0, false);
		this.game.pickUps.setAll('type', '');
		
		this.game.pickUps.callAll('animations.add', 'animations', 'rifle', [0], 20, false); 
		this.game.pickUps.callAll('animations.add', 'animations', 'shotgun', [1], 20, false); 
		this.game.pickUps.callAll('animations.add', 'animations', 'health', [2], 20, false); 
		this.game.pickUps.callAll('animations.add', 'animations', 'shield', [3], 20, false); 
		this.game.pickUps.callAll('animations.add', 'animations', 'rocket', [4], 20, false); 
		this.game.pickUps.callAll('animations.add', 'animations', 'two-guns', [5], 20, false); 
		
	}
	