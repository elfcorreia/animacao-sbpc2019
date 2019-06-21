
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function contain(sprite, container) {
	let collision = undefined;

	//Left
	if (sprite.x < container.x) {
		sprite.x = container.x;
		collision = "left";
	}

	//Top
	if (sprite.y < container.y) {
		sprite.y = container.y;
		collision = "top";
	}

	//Right
	if (sprite.x + sprite.width > container.width) {
		sprite.x = container.width - sprite.width;
		collision = "right";
	}

	//Bottom
	if (sprite.y + sprite.height > container.height) {
		sprite.y = container.height - sprite.height;
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

let resources = {
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
}

let game_size = { width: 1200, height: 600 }
let sidemap_rect = { x: game_size.width - 400, y: 0, width: 400, height: game_size.height }
let blood_rect = { x: 0, y: 0, width: game_size.width - sidemap_rect.width, height: game_size.height }

function Game() {
	
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
		this.app.renderer.resize(game_size.width, game_size.height);

	    el.appendChild(this.app.view);
  	}

	this.setup_cell = function (sprite_container, texture) {
		let sprite = new PIXI.Sprite(
			PIXI.loader.resources[texture].texture
		);
		sprite.vx = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);
		sprite.vy = Math.random()*0.3 * (Math.random() > 0.5 ? 1 : -1);

		sprite.x = randomInt(0, blood_rect.width - sprite.width);
		sprite.y = randomInt(0, blood_rect.height - sprite.height);
		sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);

		sprite_container.addChild(sprite);
	}

	this.setup_random_cell = function (sprite_container, resource_collection) {		
		this.setup_cell(sprite_container, resource_collection[randomInt(0, resource_collection.length - 1)]);
	}	

  	this.setupBloodMap = function() {
  		console.log("setup blood map...");
  		
  		this.bloodMap = new PIXI.Container();
  		
  		// background
		let background = new PIXI.Graphics();
		background.beginFill(0x660000);
		background.drawRect(blood_rect.x, blood_rect.y, blood_rect.width, blood_rect.height);
		background.endFill();
		background.x = blood_rect.x;
		background.y = blood_rect.y;
		this.bloodMap.addChild(background);

  		this.sprites = {}

  		this.sprites["blood"] = new PIXI.Container();
  		for (let i=0; i < 40; i++) {
  			this.setup_random_cell(this.sprites["blood"], resources["blood"]);
  		}
  		this.bloodMap.addChild(this.sprites["blood"]);

  		this.sprites["imuno"] = new PIXI.Container();
  		for (let i=0; i < 6; i++) {
  			this.setup_random_cell(this.sprites["imuno"], resources["imuno"]);
  		}
  		this.bloodMap.addChild(this.sprites["imuno"]);

  		this.sprites["bacteria"] = new PIXI.Container();
  		let bacteria_texture = resources["bacteria"][randomInt(0, resources["bacteria"].length - 1)];
  		for (let i=0; i < 20; i++) {
  			this.setup_cell(this.sprites["bacteria"], bacteria_texture);
  		}
  		this.bloodMap.addChild(this.sprites["bacteria"])
  		
  		this.app.stage.addChild(this.bloodMap);
  	}

  	this.setupSideMap = function() {
  		console.log("setup sidemap...");

  		this.sideMap = new PIXI.Container();
  		
  		// background
		let background = new PIXI.TilingSprite(
			PIXI.loader.resources[resources["sidemap_background"][0]].texture,
			sidemap_rect.width,
			sidemap_rect.height,
		);
		background.x = sidemap_rect.x;
		background.y = sidemap_rect.y;
		this.sideMap.addChild(background);

		let style = new PIXI.TextStyle({
			fontFamily: "Futura",
			fontSize: 24,
			fill: "white"
		});

		// player1 bar
		let player1_avatar = new PIXI.Sprite(
			PIXI.loader.resources[resources["players"][0]].texture
		);
		inner_layout(player1_avatar, "top right", background);
		this.sideMap.addChild(player1_avatar);
		
		let player1_name = new PIXI.Text("ALGORITMO", style);
		inner_layout(player1_name, "top left", background);
		relative_layout(player1_name, "left", player1_avatar);
		this.sideMap.addChild(player1_name);

		//player 2 bar
		let player2_avatar = new PIXI.Sprite(
			PIXI.loader.resources[resources["players"][1]].texture
		);
		inner_layout(player2_avatar, "bottom left", background);
		this.sideMap.addChild(player2_avatar);
		
		let player2_name = new PIXI.Text("JOGADOR", style);
		inner_layout(player2_name, "bottom left", background);
		relative_layout(player2_name, "right", player2_avatar);
		this.sideMap.addChild(player2_name);		

		this.player1_card = new PIXI.Sprite(
			PIXI.loader.resources[resources["cards"][0]].texture
		);
		this.player1_card.height = 160;
		this.player1_card.width = 100;
		this.player1_card.x = sidemap_rect.x + sidemap_rect.width / 2 - this.player1_card.width;
		this.player1_card.y = sidemap_rect.y + (sidemap_rect.height - this.player1_card.height) / 2;
		this.sideMap.addChild(this.player1_card);

		this.player2_card = new PIXI.Sprite(
			PIXI.loader.resources[resources["cards"][0]].texture
		);
		this.player2_card.height = 160;
		this.player2_card.width = 100;
		this.player2_card.x = sidemap_rect.x + (sidemap_rect.width + this.player2_card.width) / 2;
		this.player2_card.y = sidemap_rect.y + (sidemap_rect.height - this.player2_card.height) / 2;
		this.sideMap.addChild(this.player2_card);

		this.app.stage.addChild(this.sideMap);
  	}

    this.play = function (delta) {
    	let bac_and_imuno_cells = this.sprites["bacteria"].children.concat(this.sprites["imuno"].children);

    	for (let k in bac_and_imuno_cells) {
    		// check bounds
	    	let hitswall = contain(bac_and_imuno_cells[k], {x: 0, y: 0, width: blood_rect.width, height: blood_rect.height});

	    	// change direction
	    	if (hitswall === "bottom" || hitswall === "top") {
	    		bac_and_imuno_cells[k].vy *= -1;
	    	} else if (hitswall === "left" || hitswall === "right") {
	    		bac_and_imuno_cells[k].vx *= -1;
	    	}

	    	// check collission
	    	for (let kk in bac_and_imuno_cells) {
	    		if (k === kk) {
	    			continue;
	    		}
	    		if (check_collission(bac_and_imuno_cells[k], bac_and_imuno_cells[kk])) {
	    			if (Math.random() < 0.5) {
	    				bac_and_imuno_cells[k].vx *= -1;
	    				bac_and_imuno_cells[k].vy *= -1;
	    			}
	    		}
	    	}

	    	bac_and_imuno_cells[k].x += bac_and_imuno_cells[k].vx;
	    	bac_and_imuno_cells[k].y += bac_and_imuno_cells[k].vy;
	    }
    }

  	this.mainLoop = function() {
  		console.log("loading resources...");

  		let all = new Array();  		
  		for (let k in resources) {
  			all = all.concat(resources[k]);
  		}
  		console.log("resources", all);

  		let self = this;
  		PIXI.loader.add(all).load(function () {
			console.log("setup...");
			self.setupBloodMap();
			self.setupSideMap();
  			self.app.ticker.add(function (delta) {
  				// console.log("ticker", delta)
  				self.play(delta);
  			});
  		});
  	}

}