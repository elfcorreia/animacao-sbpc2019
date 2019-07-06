let BACTERIA_RADIUS = 24;
let IMUNO_RADIUS = 46;

function PlayStrategy() {

	this.currentState = "ready";

	this.actions = {};	
	this.attack_target = {};

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
		if (this.eat_mode) {
			
			// bacterias keep moving
			let bacteria_cells = game.get_bacteria_cells();
			for (let k in bacteria_cells) {
				if (this.actions[k]) {
					continue;
				}
				let d = pick_a_empty_place_near(bacteria_cells[k], cells, 30);
				let cmd = "cell " + k + " m " + d.x + " " + d.y;
				this.actions[k] = {
					cmd: cmd,
					ttl: randomInt(300, 700),
				}
				cmds.push(cmd);				
			}

			// imuno pursuit bacteria
			let imuno_cells = game.get_imuno_cells();

			for (let k in imuno_cells) {
				let imuno = imuno_cells[k];

				if (this.actions[k]) {
					// remove killed bacteria
					if (this.attack_target[imuno]) {
						var is_present = false;
						for (let j in bacteria_cells) {
							if (bacteria_cells[j].id === this.attack_target[imuno]) {
								is_present = true;
							}
						}
						if (!is_present) {
							delete this.attack_target[imuno];
						}
					}
					continue;
				}

				if (!this.attack_target[imuno]) {
					// pick target to attack
					let ref_x = imuno.x + IMUNO_RADIUS;
					let ref_y = imuno.y + IMUNO_RADIUS;
									
					bacteria_cells.sort(function (obj1, obj2) {
						let dx1 = ref_x - (obj1.x + BACTERIA_RADIUS);
						let dy1 = ref_y - (obj1.y + BACTERIA_RADIUS);
						let d1 = dx1*dx1 + dy1*dy1;
						let dx2 = ref_x - (obj2.x + BACTERIA_RADIUS);
						let dy2 = ref_y - (obj2.y + BACTERIA_RADIUS);
						let d2 = dx2*dx2 + dy2*dy2;
						
						return d1 - d2;
					});

					for (let j in bacteria_cells) {						
						var already_attacked = false;
						for (let m in this.attack_target) {
							if (this.attack_target[m] === bacteria_cells[j].id) {
								already_attacked = true;
								break;
							}
						}
						if (!already_attacked) {
							this.attack_target[imuno] = bacteria_cells[j].id;
							break;
						}
					}				
				}

				if (!this.attack_target[imuno]) {
					continue;
				}

				let target_bacteria = null;
				for (let m in bacteria_cells) {
					if (bacteria_cells[m].id === this.attack_target[imuno]) {
						target_bacteria = bacteria_cells[m];
					}					
				}
				if (!target_bacteria) {
					continue;
				}
				let cmd = "cell " + k + " m " + target_bacteria.x + " " + target_bacteria.y;
				this.actions[k] = {
					cmd: cmd,
					ttl: 100,
				}
				cmds.push(cmd);
			}
		} else {
			// random movement
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
		}

		return cmds;

	}
}