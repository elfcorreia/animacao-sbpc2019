
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function contain(sprite, x, y, width, height) {
	let collision = undefined;

	//Left
	if (sprite.x < x) {
		sprite.x = x;
		collision = "left";
	}

	//Top
	if (sprite.y < y) {
		sprite.y = y;
		collision = "top";
	}

	//Right
	if (sprite.x + sprite.width > width) {
		sprite.x = width - sprite.width;
		collision = "right";
	}

	//Bottom
	if (sprite.y + sprite.height > height) {
		sprite.y = height - sprite.height;
		collision = "bottom";
	}

	//Return the `collision` value
	return collision;
}

function check_collission(a, b) {
	return a.x < b.x + b.width
		&& a.x + a.width > b.x 
		&& a.y < b.y + b.height 
		&& a.y + a.height > b.y
}	

function relative_layout(sprite, pos, anchor) {
	if (pos === "above") {
		sprite.y = anchor.y - sprite.height;
	} else if (pos === "bellow") {
		sprite.y = anchor.y + anchor.height;
	} else if (pos === "left") {
		sprite.x = anchor.x - sprite.width;			
	} else if (pos === "right") {
		sprite.x = anchor.x + anchor.width;
	} else {
		console.log("invalid pos", pos);
	}
}

function inner_layout(sprite, pos, container) {	
	if (pos === "top left") {
		sprite.x = container.x;
		sprite.y = container.y;
	} else if (pos === "top center") {
		sprite.x = container.x + (1 + container.width - sprite.width) / 2;
		sprite.y = container.y;
	} else if (pos === "top right") {
		sprite.x = container.x + container.width - sprite.width;
		sprite.y = container.y;
	} else if (pos === "center left") {
		sprite.x = container.x;
		sprite.y = container.y + (1 + container.height - sprite.height) / 2;
	} else if (pos === "center center" || pos === "center") {
		sprite.x = container.x + (1 + container.width - sprite.width) / 2;
		sprite.y = container.y + (1 + container.height - sprite.height) / 2;
	} else if (pos === "center right") {
		sprite.x = container.x + container.width - sprite.width;
		sprite.y = container.y + (1 + container.height - sprite.height) / 2;
	} else if (pos === "bottom left") {
		sprite.x = container.x;
		sprite.y = container.y + container.height - sprite.height;
	} else if (pos === "bottom center") {
		sprite.x = container.x + (1 + container.width - sprite.width) / 2;
		sprite.y = container.y + container.height - sprite.height;
	} else if (pos === "bottom right") {
		sprite.x = container.x + container.width - sprite.width;
		sprite.y = container.y + container.height - sprite.height;
	} else {
		console.log("invalid position", pos);
	}
}

function PlayState(game) {

	this.game = game
	this.currentState = "created"

//	this.setup_cell = function (sprite_container, texture) {
//		let sprite = new PIXI.Sprite(
//			PIXI.loader.resources[texture].texture
//		);
//		sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
//		sprite.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
//		sprite.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
//
//		sprite.x = randomInt(0, blood_rect.width - sprite.width);
//		sprite.y = randomInt(0, blood_rect.height - sprite.height);
//	}

	this.onSetup = function () {
		console.log("initializing blood map...");
	  		
		this.bloodMap = new PIXI.Container();
			
		// Background
		let background = new PIXI.Graphics();
		background.beginFill(0x660000);
		background.drawRect(this.game.opt.play.x, this.game.opt.play.y, this.game.opt.play.width, this.game.opt.play.height);
		background.endFill();
		background.x = this.game.opt.play.x;
		background.y = this.game.opt.play.y;
		this.bloodMap.addChild(background);

		this.sprites = {}

		// Blood cells
		this.sprites["blood"] = new PIXI.Container();
		for (let i=0; i < 40; i++) {			
			let texture = this.game.resources["blood"][randomInt(0, this.game.resources["blood"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);					
			this.sprites["blood"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["blood"]);

		//Imuno cells
		this.sprites["imuno"] = new PIXI.Container();
		for (let i=0; i < 6; i++) {
			let texture = this.game.resources["imuno"][randomInt(0, this.game.resources["imuno"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			this.sprites["imuno"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["imuno"]);

		this.sprites["bacteria"] = new PIXI.Container();
		let texture = this.game.resources["bacteria"][randomInt(0, this.game.resources["bacteria"].length - 1)];
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
		this.game.app.stage.addChild(this.bloodMap);
	}

	this.reset = function () {
		console.log("reset");
		for (let k in this.sprites["blood"].children) {
			let sprite = this.sprites["blood"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.game.opt.play.width - sprite.width);
			sprite.y = randomInt(0, this.game.opt.play.height - sprite.height);	
		}

		for (let k in this.sprites["imuno"].children) {
			let sprite = this.sprites["imuno"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.game.opt.play.width - sprite.width);
			sprite.y = randomInt(0, this.game.opt.play.height - sprite.height);
			sprite.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
			sprite.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
			sprite.action = null;
		}

		for (let k in this.sprites["bacteria"].children) {
			let sprite = this.sprites["bacteria"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.game.opt.play.width - sprite.width);
			sprite.y = randomInt(0, this.game.opt.play.height - sprite.height);
			sprite.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
			sprite.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
			sprite.action = null;
		}

		this.currentState = "ready"
	}

	this.attack = function () {
		this.currentState = "attacking"
	}

	this.noattack = function () {
		this.currentState = "noattacking"
	}

	this.onTick = function (delta) {
		console.log("onTick");		

		if (this.currentState === "ready") {
	    	for (let k in this.bacteria_and_imuno_cells) {
	    		let cell = this.bacteria_and_imuno_cells[k];

	    		let coin = Math.random();

	    		// finish actions
	    		if (cell.action === "resting" && cell.resting_counter < 0) {
	    			cell.action = null;
	    		}

	    		// assign actions
	    		if (cell.action === null || cell.action === "walking") {
		    		if (coin < 0.5) { // walking with probability of 70%
		    			cell.action = "walking";
		    			if (coin < 0.01) { // change direction vector with probability of 1%
							cell.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
							cell.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
		    			}
		    		} else { // take a pause with probability of 30% 
			    		cell.action == "resting";
			    		cell.pause_counter = Math.random() * 3000;			    		
			    	}
			    }
		    }			
		} else if (this.currentState === "attacking") {
			for (let k in this.sprites["bacteria"].children) {
				for (let kk in this.sprites["imuno"].children) {
					let bacteria = this.sprites["bacteria"].children[k];
					let imuno = this.sprites["imuno"].children[kk];
					if (contain(bacteria, imuno.x, imuno.y, imuno.width, imuno.height)) {
						bacteria.action = "dead";
					}
				}
			}
		}

//		if (this.currentState === "ready") {
//    		// check collission
//			for (let k in this.bacteria_and_imuno_cells) {
//				let cell = this.bacteria_and_imuno_cells[k];
//		    	for (let kk in this.bacteria_and_imuno_cells) {
//		    		if (k === kk) {
//		    			continue;
//		    		}	    		
//		    		if (check_collission(cell, this.bacteria_and_imuno_cells[kk])) {
//		    			if (Math.random() < 0.5) {
//		    				cell.vx *= -1;
//		    				cell.vy *= -1;
//		    			}
//		    		}
//		    	}
//		    }
//		} else if (this.currentState === "attacking") {
//			// avoid collision between imuno-imuno			
//			for (let k in this.sprites["imuno"].children) {
//				for (let kk in this.sprites["imuno"].children) {
//					let aCell = this.sprites["imuno"].children[k];
//					let aOtherCell = this.sprites["imuno"].children[kk];
//					if (k === kk) {
//		    			continue;
//		    		}
//		    		if (check_collission(aCell, aOtherCell)) {
//		    			if (Math.random() < 0.5) {
//		    				aCell.vx *= -1;
//		    				aOtherCell.vy *= -1;
//		    			}
//		    		}
//				}
//			}
//
//			// avoid collision between bacteria-bacteria			
//			for (let k in this.sprites["bacteria"].children) {
//				for (let kk in this.sprites["bacteria"].children) {
//					let aCell = this.sprites["bacteria"].children[k];
//					let aOtherCell = this.sprites["bacteria"].children[kk];
//					if (k === kk) {
//		    			continue;
//		    		}
//		    		if (check_collission(aCell, aOtherCell)) {
//		    			if (Math.random() < 0.5) {
//		    				aCell.vx *= -1;
//		    				aOtherCell.vy *= -1;
//		    			}
//		    		}
//				}
//			}
//
//			// if imuno cell contain a bacteria, eat it
//			for (let k in this.sprites["bacteria"].children) {
//				for (let kk in this.sprites["imuno"].children) {
//					let aBacteria = this.sprites["bacteria"].children[k];
//					let aImuno = this.sprites["imuno"].children[kk];
//					if (k === kk) {
//		    			continue;
//		    		}
//		    		if (contain(aBacteria, aImuno.x, aImuno.y, aImuno.width, aImuno.height)) {
//		    			aBacteria.vx = 0;
//		    			aBacteria.vy = 0;
//		    		}
//				}
//			}
//		}

    	// execute actions
    	for (let k in this.bacteria_and_imuno_cells) {
    		let cell = this.bacteria_and_imuno_cells[k];

	    	if (cell.action === "walking") {
	    		// check bounds
		    	let hitWall = contain(cell, this.game.opt.play.x, this.game.opt.play.y, this.game.opt.play.width, this.game.opt.play.height);
		    	if (hitWall) {
		    		continue;
		    	}

		    	cell.x += cell.vx / 1.5;
		    	cell.y += cell.vy / 1.5;
	    	} else if (cell.action == "resting") {
	    		cell.resting_counter -= delta;
	    	}
	    }
    }
}

function Game(opt) {
	
	this.opt = opt;
	this.resources = {
		bacteria: [
			"assets/img/bac1.png",
			//"assets/img/bac2.png",
			//"assets/img/bac3.png",
			//"assets/img/bac4.png",
			//"assets/img/bac5.png",
	    ],
	    imuno: [		
			"assets/img/imuno1.png",
			"assets/img/imuno2.png",
			"assets/img/imuno3.png",
			"assets/img/imuno4.png",
		],
		blood: [
	    	"assets/img/blood1.png"
	    ],
	    "sidemap_background": [
	    	"assets/img/sidemap_background.png"
	    ],
	    "players": [
	    	"assets/img/algorithm.png",
	    	"assets/img/brain.png",
	    ],
	    "cards": [
	    	"assets/img/back.png",
	    	"assets/img/card_sick.png",
	    	"assets/img/card_good.png",
	    ]
	};

	this.states = [
		new PlayState(this)
	];

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
  		for (let k in this.resources) {
  			all = all.concat(this.resources[k]);
  		}
  		console.log("resources", all);

  		let self = this;
  		PIXI.loader.add(all).load(function () {
			console.log("setup...");
			for (let k in self.states) {				
				self.states[k].onSetup();
			}
			// self.setupBloodMap();
			// self.setupSideMap();
  			self.app.ticker.add(function (delta) {
  				// console.log("ticker", delta)
  				// self.play(delta);
	  			for (let k in self.states) {				
					self.states[k].onTick(delta);
				}
  			});
  		});
  	}

}