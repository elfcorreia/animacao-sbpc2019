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

	constructor(el, strategy, opt) {
		super(el, opt);
		this.opt = opt;
		this.debug = true;
		this.strategy = strategy;
	}

	onSetup() {
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

		this.sprites = {};
		this.texts = {};

		// Blood cells
		this.sprites["blood"] = new PIXI.Container();
		for (let i=0; i < 40; i++) {			
			let texture = this.opt.resources["blood"][randomInt(0, this.opt.resources["blood"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);					
			this.sprites["blood"].addChild(sprite);
		}
		this.bloodMap.addChild(this.sprites["blood"]);

		let textStyle = new PIXI.TextStyle({
			fontSize: 12,
			fill: "#ffffff"
		});

		//Imuno cells
		this.sprites["imuno"] = new PIXI.Container();
		this.texts["imuno"] = new PIXI.Container();
		for (let i=0; i < 9; i++) {
			let texture = this.opt.resources["imuno"][randomInt(0, this.opt.resources["imuno"].length - 1)]
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			sprite.alpha = 0.75;
			//sprite.rotation = Math.PI * Math.random();
			this.sprites["imuno"].addChild(sprite);			
			this.texts["imuno"].addChild(new PIXI.Text("imuno " + i, textStyle));
		}		

		// Bacteria
		this.sprites["bacteria"] = new PIXI.Container();
		this.texts["bacteria"] = new PIXI.Container();
		let start_id = this.sprites["imuno"].children.length;
		let texture = this.opt.resources["bacteria"][randomInt(0, this.opt.resources["bacteria"].length - 1)];
		for (let i=0; i < 20; i++) {
			let sprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
			this.sprites["bacteria"].addChild(sprite);
			this.texts["bacteria"].addChild(new PIXI.Text("bacteria " + (start_id + i), textStyle));
		}
		
		this.bloodMap.addChild(this.sprites["bacteria"]);		
		if (this.opt.debug) {
			this.bloodMap.addChild(this.texts["bacteria"]);
		}
		this.bloodMap.addChild(this.sprites["imuno"]);
		if (this.opt.debug) {
			this.bloodMap.addChild(this.texts["imuno"]);
		}

		// cache for onTick method
		this.bacteria_and_imuno_cells = this.sprites["imuno"].children.concat(this.sprites["bacteria"].children);

		// enter ready state
		this.reset();

		// render
		this.app.stage.addChild(this.bloodMap);
	}

	reset() {
		console.log("reset");

		this.eat_mode = false;

		for (let k in this.sprites["blood"].children) {
			let sprite = this.sprites["blood"].children[k];
			sprite.rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3.14);
			sprite.x = randomInt(0, this.opt.play.width - sprite.width);
			sprite.y = randomInt(0, this.opt.play.height - sprite.height);	
		}
		
		place_at_random(this.bacteria_and_imuno_cells, this.opt.play)

		for (let k in this.sprites["imuno"].children) {
			this.texts["imuno"].children[k].x = this.sprites["imuno"].children[k].x;
			this.texts["imuno"].children[k].y = this.sprites["imuno"].children[k].y;
		}

		for (let k in this.sprites["bacteria"].children) {
			this.texts["bacteria"].children[k].x = this.sprites["bacteria"].children[k].x;
			this.texts["bacteria"].children[k].y = this.sprites["bacteria"].children[k].y;
		}
	}

	onTick(delta) {
		console.log("onTick");
			    
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

			let hitWall = contain(sprite, this.opt.play);
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

			let hitWall = contain(sprite, this.opt.play);
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

}