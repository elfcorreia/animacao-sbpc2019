function PlayStrategy() {

	this.currentState = "ready";

	this.actions = {};	

	this.run = function (game) {
		//console.log(game);

		let cmds = [];

		if (this.currentState === "ready") {
			let cells = game.get_cells();
			for (let k in cells) {
				let is_stopped = cells[k].vx === 0 && cells[k].vx === 0;

				if (!this.actions[k] || is_stopped) {
					let coin = Math.random();
					if (coin > 0.10) {
						// assign action
						//let dx = randomSignal() * randomInt(0, 5);
						//let dy = randomSignal() * randomInt(0, 5);					
						let d = pick_a_empty_place_near(cells[k], cells, 10);
						let cmd = "cell " + k + " m " + d.x + " " + d.y;
						this.actions[k] = {
							cmd: cmd,
							ttl: randomInt(300, 700),
						}
						//console.log("assigning action", cmd);						
						cmds.push(cmd);					
					}
				} else {
					this.actions[k].ttl -= 1;					
					if (this.actions[k].ttl === 0) {
						delete this.actions[k];
					}
				}
			}
		} else if (this.currentState === "attacking") {
//			let imuno_cells = game.get_imuno_cells();
//			for (let k in imuno_cells) {
//				if (!this.actions[k]) {					
//					// assign action
					//
//					// if got a bac kill it
//
//
//					// pursuit a bac cell
//
//					let dx = randomSignal() * randomInt(0, 5);
//					let dy = randomSignal() * randomInt(0, 5);					
//					let cmd = "cell " + k + " m " + dx + " " + dy;
//					this.actions[k] = {
//						cmd: cmd,
//						ttl: randomInt(300, 700),
//					}
//					//console.log("assigning action", cmd);
//					cmds.push(cmd);					
//				} else {
//					this.actions[k].ttl -= 1;
//					if (this.actions[k].ttl === 0) {
//						delete this.actions[k];
//					}
//				}
//			}
		}

		return cmds;

//		if (this.currentState === "ready") {
//	    	for (let k in game.bacteria_and_imuno_cells) {
//	    		let cell = game.bacteria_and_imuno_cells[k];
//
//	    		let coin = Math.random();
//
//	    		// finish actions
//	    		if (cell.action === "resting" && cell.resting_counter < 0) {
//	    			cell.action = null;
//	    		}
//
//	    		// assign actions
//	    		if (cell.action === null || cell.action === "walking") {
//		    		if (coin < 0.5) { // walking with probability of 70%
//		    			cell.action = "walking";
//		    			if (coin < 0.01) { // change direction vector with probability of 1%
//							cell.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
//							cell.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
//		    			}
//		    		} else { // take a pause with probability of 30% 
//			    		cell.action == "resting";
//			    		cell.pause_counter = Math.random() * 3000;			    		
//			    	}
//			    }
//		    }			
//		} else if (this.currentState === "attacking") {
//			for (let k in game.sprites["bacteria"].children) {
//				for (let kk in game.sprites["imuno"].children) {
//					let bacteria = game.sprites["bacteria"].children[k];
//					let imuno = game.sprites["imuno"].children[kk];
//					if (contain(bacteria, imuno.x, imuno.y, imuno.width, imuno.height)) {
//						bacteria.action = "dead";
//					}
//				}
//			}
//		}
	}
}

function PlayEngine(stage, opt) {

	this.strategy = new PlayStrategy();
	this.stage = stage;
	this.opt = opt;

	this.onSetup = function () {
		console.log("initializing blood map...");
	  		
		this.bloodMap = new PIXI.Container();
			
		// Background
		let background = new PIXI.Graphics();
		background.beginFill(0x660000);
		background.drawRect(this.opt.play.x, this.opt.play.y, this.opt.play.width, this.opt.play.height);
		background.endFill();
		background.x = this.opt.play.x;
		background.y = this.opt.play.y;
		this.bloodMap.addChild(background);

		this.sprites = {}

		// Blood cells
		this.sprites["blood"] = new PIXI.Container();
		for (let i=0; i < 40; i++) {			
			let texture = this.opt.resources["blood"][randomInt(0, this.opt.resources["blood"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);					
			this.sprites["blood"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["blood"]);

		//Imuno cells
		this.sprites["imuno"] = new PIXI.Container();
		for (let i=0; i < 6; i++) {
			let texture = this.opt.resources["imuno"][randomInt(0, this.opt.resources["imuno"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			this.sprites["imuno"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["imuno"]);

		this.sprites["bacteria"] = new PIXI.Container();
		let texture = this.opt.resources["bacteria"][randomInt(0, this.opt.resources["bacteria"].length - 1)];
		for (let i=0; i < 20; i++) {
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			this.sprites["bacteria"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["bacteria"])
		
		// cache for onTick method
		this.bacteria_and_imuno_cells = this.sprites["bacteria"].children.concat(this.sprites["imuno"].children);

		// enter ready state
		this.reset();

		// render
		this.stage.app.stage.addChild(this.bloodMap);
	}

	this.reset = function () {
		console.log("reset");

		for (let k in this.sprites["blood"].children) {
			let sprite = this.sprites["blood"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.opt.play.width - sprite.width);
			sprite.y = randomInt(0, this.opt.play.height - sprite.height);	
		}

		place_at_random(this.bacteria_and_imuno_cells, this.opt.play)
	}

	this.onTick = function (delta) {
		console.log("onTick");
		
		let cmds = this.strategy.run(this);

		// if any, digest commands
		for (let k in cmds) {
			let aux = cmds[k].split(" ");
			
			if (aux.length < 4) {
				console.log("Invalid command " + cmds[k] + "!", aux);
				continue;
			}

			if (aux[0] === "cell") {
				let idx = parseInt(aux[1]);
				let sprite = this.bacteria_and_imuno_cells[idx];
				if (aux[2] === "m") {					
			    	let tx = sprite.x + parseInt(aux[3]);
			    	let ty = sprite.y + parseInt(aux[4]);
			    	sprite.target_x = tx;
			    	sprite.target_y = ty;
			    	var vx = Math.sign(tx - sprite.x) * 0.1;
			    	var vy = Math.sign(ty - sprite.y) * 0.1;
			    	sprite.vx = vx;
			    	sprite.vy = vy;			    	
			    	//console.log("parsing m cmd: ", idx, tx, ty, vx, vy);
				}
			}
		}

		for (let k in this.bacteria_and_imuno_cells) {
			let sprite = this.bacteria_and_imuno_cells[k];			

			if (Math.abs((sprite.x - sprite.vx)*(sprite.y - sprite.vy)) > 0) {
				sprite.x += sprite.vx;
				sprite.y += sprite.vy;
			}					

			let hitWall = contain(sprite, this.opt.play);
	    	if (hitWall) {
	    		sprite.vx = 0;
	    		sprite.vy = 0;
	    		continue;
	    	}

			for (let i in this.bacteria_and_imuno_cells) {
	    		let other = this.bacteria_and_imuno_cells[i];
	    		if (i === k) {
	    			continue;
	    		}

	    		if (is_touching(sprite, other)) {
	    			sprite.vx = 0;
	    			sprite.vy = 0;	    			
	    			other.vx = 0;
	    			other.vy = 0;
	    		}
	    	}
		}

		// Eat bacterias
		for (let k in this.sprites["bacteria"].children) {
			let bacteria_cell = this.sprites["bacteria"].children[k];
			for (let l in this.sprites["imuno"].children) {
				let imuno_cell = this.sprites["imuno"].children[l];
				if (is_near(bacteria_cell, imuno_cell, 400)) {
					bacteria_cell.vx = 0;
					bacteria_cell.vy = 0;	
					bacteria_cell.alpha = 0.1;				
				}
			}
		}

    }

    this.get_cells = function() {
    	let cells = [];
    	for (let k in this.bacteria_and_imuno_cells) {
    		cells.push({
    			id: k,
    			x: this.bacteria_and_imuno_cells[k].x,
    			y: this.bacteria_and_imuno_cells[k].y,
    			vx: this.bacteria_and_imuno_cells[k].vx,
    			vy: this.bacteria_and_imuno_cells[k].vy,
    		});
    	}
    	return cells;
    }

    this.get_imuno_cells = function() {
    	let cells = [];
    	for (let k in this.sprites["imuno"]) {
    		cells.push({
    			id: k,
    			x: this.sprites["imuno"][k].x,
    			y: this.sprites["imuno"][k].y,
    			vx: this.sprites["imuno"][k].vx,
    			vy: this.sprites["imuno"][k].vy,
    		});
    	}
    	return cells;
    }

}

function Game(opt) {
	
	this.opt = opt;

	this.init = function(el) {
		console.log("initializing pixi...")

		if (!PIXI.utils.isWebGLSupported()) {
	      type = "canvas"
	    }

	    PIXI.utils.sayHello("WebGL")

	    this.app = new PIXI.Application({
	    	antialias: true,
	    	forceCanvas: true,    
	    });
	    
	    //this.app.renderer.backgroundColor = 0x660000;
	    //app.renderer.view.style.position = "absolute";
		//app.renderer.view.style.display = "block";
		this.app.renderer.autoDensity = true;
		this.app.renderer.resize(this.opt.width, this.opt.height);

		this.engines = [new PlayEngine(this, this.opt)];

	    el.appendChild(this.app.view);
  	}

//  	this.setupSideMap = function() {
//  		console.log("setup sidemap...");
//
//  		this.sideMap = new PIXI.Container();
  		//
//  		// background
//		let background = new PIXI.TilingSprite(
//			PIXI.loader.resources[resources["sidemap_background"][0]].texture,
//			sidemap_rect.width,
//			sidemap_rect.height,
//		);
//		background.x = sidemap_rect.x;
//		background.y = sidemap_rect.y;
//		this.sideMap.addChild(background);
//
//		let style = new PIXI.TextStyle({
//			fontFamily: "Futura",
//			fontSize: 24,
//			fill: "white"
//		});
//
//		// player1 bar
//		let player1_avatar = new PIXI.Sprite(
//			PIXI.loader.resources[resources["players"][0]].texture
//		);
//		inner_layout(player1_avatar, "top right", background);
//		this.sideMap.addChild(player1_avatar);
		//
//		let player1_name = new PIXI.Text("ALGORITMO", style);
//		inner_layout(player1_name, "top left", background);
//		relative_layout(player1_name, "left", player1_avatar);
//		this.sideMap.addChild(player1_name);
//
//		//player 2 bar
//		let player2_avatar = new PIXI.Sprite(
//			PIXI.loader.resources[resources["players"][1]].texture
//		);
//		inner_layout(player2_avatar, "bottom left", background);
//		this.sideMap.addChild(player2_avatar);
		//
//		let player2_name = new PIXI.Text("JOGADOR", style);
//		inner_layout(player2_name, "bottom left", background);
//		relative_layout(player2_name, "right", player2_avatar);
//		this.sideMap.addChild(player2_name);		
//
//		this.player1_card = new PIXI.Sprite(
//			PIXI.loader.resources[resources["cards"][0]].texture
//		);
//		this.player1_card.height = 160;
//		this.player1_card.width = 100;
//		this.player1_card.x = sidemap_rect.x + sidemap_rect.width / 2 - this.player1_card.width;
//		this.player1_card.y = sidemap_rect.y + (sidemap_rect.height - this.player1_card.height) / 2;
//		this.sideMap.addChild(this.player1_card);
//
//		this.player2_card = new PIXI.Sprite(
//			PIXI.loader.resources[resources["cards"][0]].texture
//		);
//		this.player2_card.height = 160;
//		this.player2_card.width = 100;
//		this.player2_card.x = sidemap_rect.x + (sidemap_rect.width + this.player2_card.width) / 2;
//		this.player2_card.y = sidemap_rect.y + (sidemap_rect.height - this.player2_card.height) / 2;
//		this.sideMap.addChild(this.player2_card);
//
//		this.app.stage.addChild(this.sideMap);
//  	}

//    this.play = function (delta) {
//    	let bac_and_imuno_cells = this.sprites["bacteria"].children.concat(this.sprites["imuno"].children);
//
//    	for (let k in bac_and_imuno_cells) {
//    		// check bounds
//	    	let hitswall = contain(bac_and_imuno_cells[k], {x: 0, y: 0, width: blood_rect.width, height: blood_rect.height});
//
//	    	// change direction
//	    	if (hitswall === "bottom" || hitswall === "top") {
//	    		bac_and_imuno_cells[k].vy *= -1;
//	    	} else if (hitswall === "left" || hitswall === "right") {
//	    		bac_and_imuno_cells[k].vx *= -1;
//	    	}
//
//	    	// check collission
//	    	for (let kk in bac_and_imuno_cells) {
//	    		if (k === kk) {
//	    			continue;
//	    		}
//	    		if (check_collission(bac_and_imuno_cells[k], bac_and_imuno_cells[kk])) {
//	    			if (Math.random() < 0.5) {
//	    				bac_and_imuno_cells[k].vx *= -1;
//	    				bac_and_imuno_cells[k].vy *= -1;
//	    			}
//	    		}
//	    	}
//
//	    	bac_and_imuno_cells[k].x += bac_and_imuno_cells[k].vx;
//	    	bac_and_imuno_cells[k].y += bac_and_imuno_cells[k].vy;
//	    }
//    }

  	this.mainLoop = function() {
  		console.log("loading resources...");

  		let all = new Array();  		
  		for (let k in this.opt.resources) {
  			all = all.concat(this.opt.resources[k]);
  		}
  		console.log("resources", all);

  		let self = this;
  		PIXI.loader.add(all).load(function () {
			console.log("setup...");
			for (let k in self.engines) {				
				self.engines[k].onSetup();
			}
			// self.setupBloodMap();
			// self.setupSideMap();
  			self.app.ticker.add(function (delta) {
  				// console.log("ticker", delta)
  				// self.play(delta);
	  			for (let k in self.engines) {				
					self.engines[k].onTick(delta);
				}
  			});
  		});
  	}

}