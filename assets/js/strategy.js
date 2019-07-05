function PlayStrategy() {

	this.currentState = "ready";

	this.actions = {};	
	this.pursuit = {};

	this.run = function (game) {
		let cmds = [];
		this.currentState = "attacking"; //"attacking";				
		let cells = game.get_cells();

		// decrement ttl
		for (let k in cells) {			
			if (this.actions[k]) {
				this.actions[k].ttl -= 1;					
				if (this.actions[k].ttl === 0) {
					delete this.actions[k];
				}
			}
		}

		// assign actions
		if (this.currentState === "ready") {
			for (let k in cells) {
				if (this.actions[k]) {
					continue;
				}
				let d = pick_a_empty_place_near(cells[k], cells, 30);
				let cmd = "cell " + k + " m " + d.x + " " + d.y;
				this.actions[k] = {
					cmd: cmd,
					ttl: randomInt(300, 700),
				}
				cmds.push(cmd);				
			}
		} else if (this.currentState === "attacking") {
			let imuno_cells = game.get_imuno_cells();
			console.log("imuno_cells", imuno_cells);

			let bacteria_cells = game.get_bacteria_cells();

			for (let k in imuno_cells) {
				if (this.actions[k]) {
					continue;
				}
				var target_bacteria = null;
				let imuno = imuno_cells[k];
				let ref_x = imuno.x + imuno.width/2; // TODO: Aqui
				let ref_y = imuno.y + imuno.height/2;
				bacteria_cells.sort(function (obj1, obj2) {
					console.log(ref_x, ref_y, obj1, obj2);

					let dx1 = ref_x - (obj1.x + 24);
					let dy1 = ref_y - (obj1.y + 24);
					let d1 = dx1*dx1 + dy1*dy1;
					let dx2 = ref_x - (obj2.x + 24);
					let dy2 = ref_y - (obj2.y + 24);
					let d2 = dx2*dx2 + dy2*dy2;
					
					console.log(d1, d2);

					return d1 - d2;
				});
				console.log("imuno", k, "near bacteria", bacteria_cells[0].id);
			}
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