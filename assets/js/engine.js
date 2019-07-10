class BaseEngine {

	constructor(el, opt) {
		this.opt = opt;

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

	mainLoop() {
  		console.log("loading resources...");
  		let all = new Array();  		
  		for (let k in this.opt.resources) {
  			all = all.concat(this.opt.resources[k]);
  		}
  		console.log("resources", all);

  		let self = this;
  		PIXI.loader.add(all).load(function () {
			console.log("setup...");
			self.onSetup();			
			self.app.ticker.add(function (delta) {
  				if (self.opt.debug && self._done) {
  					return;	
  				}
	  			self.onTick(delta);
				if (self.opt.debug && !self._done) {
					self._done = true;
				}
  			});
  		});
  	}
}

class PlayEngine extends BaseEngine {

	constructor(el, strategy, data, opt) {
		super(el, opt);
		this.strategy = strategy;
		this.data = data;
		this.opt = opt;		
		el.addEventListener("keydown", this.onKeyDown.bind(this), true);
	}

	setupBloodMap() {
		console.log("initializing blood map...");
	  		
		this.bloodMap = new PIXI.Container();
			
		// background
		let background = new PIXI.Graphics();
		background.beginFill(this.opt.bloodmap.bgcolor);
		background.drawRect(this.opt.bloodmap.x, this.opt.bloodmap.y, this.opt.bloodmap.width, this.opt.bloodmap.height);
		background.endFill();
		background.x = this.opt.bloodmap.x;
		background.y = this.opt.bloodmap.y;
		this.bloodMap.addChild(background);

		this.sprites = {};
		this.texts = {};

		// blood cells
		this.sprites["blood"] = new PIXI.Container();
		for (let i = 0; i < this.opt.bloodmap.cells.blood.count; i++) {			
			let texture = this.opt.resources["blood"][randomInt(0, this.opt.resources["blood"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);					
			this.sprites["blood"].addChild(sprite);
		}

		// imuno cells
		this.sprites["imuno"] = new PIXI.Container();
		for (let i = 0; i < this.opt.bloodmap.cells.imuno.count; i++) {
			let texture = this.opt.resources["imuno"][randomInt(0, this.opt.resources["imuno"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			sprite.alpha = this.opt.bloodmap.cells.imuno.alpha;
			this.sprites["imuno"].addChild(sprite);
		}

		// bacteria cells
		this.sprites["bacteria"] = new PIXI.Container();
		let texture = this.opt.resources["bacteria"][randomInt(0, this.opt.resources["bacteria"].length - 1)];
		for (let i = 0; i < this.opt.bloodmap.cells.bacteria.count; i++) {
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			this.sprites["bacteria"].addChild(sprite);
		}

		// cache sprites for onTick method
		this.bacteria_and_imuno_cells = this.sprites["imuno"].children.concat(this.sprites["bacteria"].children);

		// render
		this.bloodMap.addChild(this.sprites["blood"]);
		this.bloodMap.addChild(this.sprites["bacteria"]);
		this.bloodMap.addChild(this.sprites["imuno"]);

		// put debug texts
		if (this.opt.debug) {
			let textStyle = new PIXI.TextStyle({
				fontSize: 12,
				fill: "#ffffff"
			});
			let group = new PIXI.Container();
			for (let i = 0; i < this.sprites["imuno"].children; i++) {
				group.addChild(new PIXI.Text("imuno " + i, textStyle));
			}
			let start_bacteria_id = this.sprites["imuno"].children.length;
			for (let i = 0; i < this.sprites["bacteria"].children; i++) {
				group.addChild(new PIXI.Text("bacteria " + (start_bacteria_id + i), textStyle));
			}
			this.sprite_labels = group;
		}
		
		this.app.stage.addChild(this.bloodMap);
	}

	setupScoreBar() {
		this.scores = {};

		let PLAYER_NAME_TOP_PADDING = 8;
		let score_texture = this.opt.resources["score"][0];

		let textStyle = new PIXI.TextStyle({
			fontSize: 18,
			fill: "#ffffff"
		});

		// player1 scorebar
		let player1_scorebar = new PIXI.Container();
		let texture = this.opt.resources["players"][0];
		let player1_icon = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
		player1_scorebar.addChild(player1_icon);
		
		let player1_name = new PIXI.Text(this.opt.scorebar.player1.name, textStyle);
		player1_name.x = player1_icon.x + player1_icon.width;
		player1_name.y = PLAYER_NAME_TOP_PADDING;
		player1_scorebar.addChild(player1_name);
		
		this.scores["player1"] = new PIXI.Container();

		for (let i = 0; i < this.opt.scorebar.score.max; i++) {
			let aux = new PIXI.Sprite(PIXI.loader.resources[score_texture].texture);
			aux.x = this.opt.scorebar.score.width * i;
			this.scores["player1"].addChild(aux);
		}
		this.scores["player1"].x = player1_icon.x + player1_icon.width;
		this.scores["player1"].y = player1_name.y + player1_name.height;
		player1_scorebar.addChild(this.scores["player1"]);

		// player2 scorebar
		let player2_scorebar = new PIXI.Container();
		let texture2 = this.opt.resources["players"][1];
		let player2_icon = new PIXI.Sprite(PIXI.loader.resources[texture2].texture);
		player2_icon.x = this.opt.scorebar.width - player2_icon.width;
		player2_scorebar.addChild(player2_icon);
		
		let player2_name = new PIXI.Text(this.opt.scorebar.player2.name, textStyle);
		player2_name.x = this.opt.scorebar.width - player2_icon.width - player2_name.width;
		player2_name.y = PLAYER_NAME_TOP_PADDING;
		player2_scorebar.addChild(player2_name);
		
		this.scores["player2"] = new PIXI.Container();

		for (let i = 0; i < this.opt.scorebar.score.max; i++) {
			let aux = new PIXI.Sprite(PIXI.loader.resources[score_texture].texture);
			aux.x = aux.width * this.opt.scorebar.score.max - (i * aux.width);
			this.scores["player2"].addChild(aux);
		}
		this.scores["player2"].x = this.opt.scorebar.width - player2_icon.width - (this.opt.scorebar.score.width * (this.opt.scorebar.score.max + 1));
		this.scores["player2"].y = player2_name.y + player2_name.height;
		player2_scorebar.addChild(this.scores["player2"]);
		player2_scorebar.x = this.opt.bloodmap.width - this.opt.scorebar.width;			
		
		this.app.stage.addChild(player1_scorebar);
		this.app.stage.addChild(player2_scorebar);
	}

	setupBottom() {
		this.decks = {}
		let textStyle = new PIXI.TextStyle(this.opt.bottom.textStyle);
		let group = new PIXI.Container();

		let background = new PIXI.TilingSprite(
			PIXI.loader.resources[this.opt.resources.bottom_background[0]].texture,
			this.opt.bottom.width,
			this.opt.bottom.height,
		);
		group.addChild(background);

		this.decks["player1"] = new PIXI.Container();
		for (let i = 0; i < this.opt.resources.deck.length; i++) {
			let sprite = new PIXI.Sprite(PIXI.loader.resources[this.opt.resources.deck[i]].texture);
			sprite.width = this.opt.bottom.deck.card.width;
			sprite.height = this.opt.bottom.deck.card.height;
			this.decks["player1"].addChild(sprite);
		}		
		group.addChild(this.decks["player1"]);

		this.decks["player2"] = new PIXI.Container();
		for (let i = 0; i < this.opt.resources.deck.length; i++) {
			let sprite = new PIXI.Sprite(PIXI.loader.resources[this.opt.resources.deck[i]].texture);
			sprite.width = this.opt.bottom.deck.card.width;
			sprite.height = this.opt.bottom.deck.card.height;		
			this.decks["player2"].addChild(sprite);
		}
		this.decks["player2"].x = this.opt.bottom.width - this.opt.bottom.deck.width;
		group.addChild(this.decks["player2"]);

		this.status_text = new PIXI.Text("TURNO 1", textStyle);
		this.status_text.x = (this.opt.bottom.width / 2) - (this.status_text.width / 2);
		group.addChild(this.status_text);

		this.help_text = new PIXI.Text("Ajuda", textStyle);
		this.help_text.x = (this.opt.bottom.width / 2) - (this.status_text.width / 2);
		this.help_text.y = this.opt.bottom.height - this.help_text.height;
		group.addChild(this.help_text);

		this.epitopo_text = new PIXI.Text("XXXXXXXXX", textStyle);
		this.epitopo_text.x = (this.opt.bottom.width / 2) - (this.epitopo_text.width / 2);
		this.epitopo_text.y = this.status_text.y + this.status_text.height;
		group.addChild(this.epitopo_text);
		
		group.y = this.opt.height - this.opt.bottom.height;
		this.app.stage.addChild(group);
	}

	onSetup() {
		this.setupBloodMap();
		this.setupScoreBar();
		this.setupBottom();

		this.enter_new_game_state();
	}

	enter_new_game_state() {
		console.log("entering new game state");

		this.player1_score = 0;
		this.player2_score = 0;
		this.setScore("player1", 0);
		this.setScore("player2", 0);
		
		this.round = 0;	
		this.enter_start_round_state();		
	}

	enter_start_round_state() {
		console.log("enter start round state");
		
		this.eat_mode = false;
		this.round += 1;
		this.setStatus("TURNO " + this.round);
		this.setEpitopo(this.data.getEpitopo());

		for (let k in this.sprites["blood"].children) {
			let sprite = this.sprites["blood"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.opt.bloodmap.width - sprite.width);
			sprite.y = randomInt(0, this.opt.bloodmap.height - sprite.height);
		}
		
		place_at_random(this.bacteria_and_imuno_cells, this.opt.bloodmap)

		for (let k in this.sprites["bacteria"].children) {
			this.sprites["bacteria"].children[k].alpha = 1;
		}

		if (this.opt.debug) {
			for (let k in this.bacteria_and_imuno_cells.children) {
				this.sprite_labels.children[k].x = this.bacteria_and_imuno_cells.children[k].x;
				this.sprite_labels.children[k].y = this.bacteria_and_imuno_cells.children[k].y;
			}
		}

		this.selectedCard = {};
		this.selectedCard["player1"] = this.data.getAlgorithmChoice() ? 1 : 2;		
		this.showCard("player1", 0);
		this.selectedCard["player2"] = 1;
		this.showCard("player2", 1);
		this.enter_select_card_state();
	}

	enter_select_card_state() {
		console.log("enter select card state");
		this.state = "select-card";
		this.setHelp("Use as setas <-- --> para selecionar sua carta\ne pressione Enter");
	}

	enter_end_round_state() {
		this.state = "end-round-state";

		this.showCard("player1", this.selectedCard["player1"]);

		this.ground_true = this.data.getGroundTrue();
		//console.log("end-round-state", "ground_true", ground_true, "selectedCard", this.selectedCard);
		this.eat_mode = this.ground_true;
		if (this.ground_true) {
			this.setHelp("Houve resposta imunológica!");
		} else {
			this.setHelp("Não houve resposta imunológica!");
		}
		setTimeout(this.enter_score_round_state.bind(this), this.opt.scoring_timeout);
	}

	enter_score_round_state() {
		var player1 = false;
		var player2 = false;
		console.log(this);

		var response = this.selectedCard["player1"] === 2;
		if (response === this.ground_true) {
			this.player1_score += 1;
			this.setScore("player1", this.player1_score);
			player1 = true;
		}

		response = this.selectedCard["player2"] === 2;
		if (response === this.ground_true) {
			this.player2_score += 1;
			this.setScore("player2", this.player2_score);
			player2 = true;
		}

//		console.log("score_round", { 
//			ground_true: this.ground_true, 
//			selectedCard: this.selectedCard, 
//			player1_score: this.player1_score, 
//			player2_score: this.player2_score
//		});

		if (player1 && player2) {
			this.setHelp("Ambos acertaram!");
		} else if (player1 && !player2) {
			this.setHelp("Algoritmo marcou ponto!");
		} else if (!player1 && player2) {
			this.setHelp("Você marcou ponto!");
		} else {
			this.setHelp("Ninguém marcou ponto!");
		}
		setTimeout(this.enter_start_round_state.bind(this), this.opt.scoring_timeout);		
	}

	onKeyDown(event) {
		console.log("onKeyDown", this, event);

		if (event.code == "Escape") {
			this.enter_new_game_state();
			return;
		}

		if (this.state == "select-card") {
			if (event.code === "ArrowRight") {
				this.selectedCard["player2"] += 1;
				if (this.selectedCard["player2"] >= this.opt.resources.deck.length) {
					this.selectedCard["player2"] = 1;
				}
				this.showCard("player2", this.selectedCard["player2"]);
			} else if (event.code === "ArrowLeft") {
				this.selectedCard["player2"] -= 1;
				if (this.selectedCard["player2"] <= 0) {
					this.selectedCard["player2"] = this.opt.resources.deck.length - 1;
				}
				this.showCard("player2", this.selectedCard["player2"]);
			} else if (event.code == "Enter") {
				this.enter_end_round_state();
			}
			//console.log("key", this.selectedCard)
		}		
	}

	onTick(delta) {
		//console.log("onTick");
			    
		let cmds = this.strategy.run(this);

		// if any, digest commands
		for (let k in cmds) {
			let aux = cmds[k].split(" ");
			
			if (aux.length < 4) {
				console.log("Invalid command " + cmds[k] + "!", aux);
				continue;
			}

			var source_objects = null;

			if (aux[0] === "cell") {
				source_objects = this.bacteria_and_imuno_cells;
			} else if (aux[0] === "imuno") {
				source_objects = this.sprites["imuno"].children;
			} else if (aux[0] === "bacteria") {
				source_objects = this.sprites["bacteria"].children;
			}

			let idx = parseInt(aux[1]);
			let sprite = source_objects[idx];

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

		for (let k in this.sprites["bacteria"].children) {
			let sprite = this.sprites["bacteria"].children[k];

			let far_from_destiny = Math.abs((sprite.x - sprite.target_x)*(sprite.y - sprite.target_y)) > 0;
			if (far_from_destiny) {				
				sprite.x += sprite.vx;
				sprite.y += sprite.vy;
			}

			let hitWall = contain(sprite, this.opt.bloodmap);
	    	if (hitWall) {
	    		sprite.vx = 0;
	    		sprite.vy = 0;
	    		continue;
	    	}				
	    }

		for (let k in this.sprites["imuno"].children) {
			let sprite = this.sprites["imuno"].children[k];

			let far_from_destiny = Math.abs((sprite.x - sprite.target_x)*(sprite.y - sprite.target_y)) > 0;
			if (far_from_destiny) {				
				sprite.x += (this.eat_mode ? 3 : 1) * sprite.vx;
				sprite.y += (this.eat_mode ? 3 : 1) * sprite.vy;
			}

			let hitWall = contain(sprite, this.opt.bloodmap);
	    	if (hitWall) {
	    		sprite.vx = 0;
	    		sprite.vy = 0;
	    		continue;
	    	}
	    }

		if (this.eat_mode) {
			// avoid imuno cell colission
			avoid_collisions(this.sprites["imuno"].children);
			avoid_collisions(this.sprites["bacteria"].children);
		} else {
			// avoid any cell colission
			avoid_collisions(this.bacteria_and_imuno_cells);
		}

		// Eat bacterias
		for (let k in this.sprites["bacteria"].children) {
			let bacteria_cell = this.sprites["bacteria"].children[k];
			for (let l in this.sprites["imuno"].children) {
				let imuno_cell = this.sprites["imuno"].children[l];
				if (is_near(bacteria_cell, imuno_cell, 900)) {
					bacteria_cell.vx = 0;
					bacteria_cell.vy = 0;	
					bacteria_cell.alpha = 0.25;
					bacteria_cell.dead = true;					
				}
			}
		}

    }

    get_cells() {
    	let cells = [];
    	for (let k in this.bacteria_and_imuno_cells) {
    		let cell = this.bacteria_and_imuno_cells[k];
    		if (cell.dead) {
    			continue;
    		}
    		cells.push({
    			id: parseInt(k),
    			x: cell.x,
    			y: cell.y,
    			vx: cell.vx,
    			vy: cell.vy,
    		});
    	}
    	return cells;
    }

	get_imuno_cells() {
		let cells = [];		
		for (let k in this.sprites["imuno"].children) {
			let cell = this.sprites["imuno"].children[k];
    		if (cell.dead) {
    			continue;
    		}
    		cells.push({
    			id: parseInt(k),
    			x: cell.x,
    			y: cell.y,
    			vx: cell.vx,
    			vy: cell.vy,
    		});
		}
		return cells;
	}

	get_bacteria_cells() {
		let cells = [];
		let start_id = this.sprites["imuno"].children.length;
		for (let k in this.sprites["bacteria"].children) {
			let cell = this.sprites["bacteria"].children[k];
    		if (cell.dead) {
    			continue;
    		}
    		cells.push({
    			id: parseInt(k),
    			x: cell.x,
    			y: cell.y,
    			vx: cell.vx,
    			vy: cell.vy,
    		});
		}
		//console.log("get_bacteria_cells", cells);
		return cells;
	}

	setScore(player, score) {
		for (let i = 0; i < this.opt.scorebar.score.max; i++) {
			this.scores[player].children[i].visible = i < score;
		}
	}

	showCard(player, card_index) {
		let n = this.decks[player].children.length;
		//console.log("showCard", n);
		for (let i = 0; i < n; i++) {
			//console.log(i, i == card_index);
			this.decks[player].children[i].visible = i == card_index;
		}
	}

	setEpitopo(text) {
		this.epitopo_text.text = text;
	}

	setStatus(text) {
		this.status_text.text = text;
	}

	setHelp(text) {
		this.help_text.text = text;	
	}

}