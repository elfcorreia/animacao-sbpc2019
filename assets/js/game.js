function Game(opt) {
	
	this.opt = opt;
	this.debug = true;

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
  				if (self.debug && self.done) {
  					return;	
  				}
	  			for (let k in self.engines) {				
					self.engines[k].onTick(delta);
				}
				if (self.debug && !self.done) {
					self.done = true;
				}
  			});
  		});
  	}

}