
function randomInt(min, max) {
	return parseInt(Math.random() * (max - min + 1)) + min;
}

function randomSignal() {
	return Math.random() > 0.5 ? 1 : -1;
}

function is_near(obj1, obj2, squared_minimun_distance_radius) {
	let dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
	let dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
	let d = dx*dx + dy*dy;
	return d < squared_minimun_distance_radius;
}

function is_touching(obj1, obj2) {	
	let dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
	let dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
	let d = dx*dx + dy*dy;
	let r = obj1.width/2 + obj2.width/2;
	return d < r*r;
//	return obj1.x < obj2.x + obj2.width &&
//	   obj1.x + obj1.width > obj2.x &&
//	   obj1.y < obj2.y + obj2.height &&
//	   obj1.y + obj1.height > obj2.y;
}

function contain(obj, rect) {
	let radius = obj.width;	
	let center_x = obj.x + radius;
	let center_y = obj.y + radius;

	//Left
	if (Math.abs(rect.x - center_x) <= radius) {
		obj.vx *= -1;
	}

	//Top
	if (Math.abs(rect.y - center_y) <= radius) {
		obj.vy *= -1;
	}

	//Right
	if (obj.x + radius >= rect.width) {
		obj.vx *= -1;
	}

	//Bottom
	if (obj.y + radius >= rect.height) {
		obj.vy *= -1;
	}
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

function viewport(element) {
	element.style.setProperty("height", document.defaultView.innerHeight)
	element.style.setProperty("width", document.defaultView.innerWidth)

	document.defaultView.onresize = function () {
		console.log("on resize")
		element.style.setProperty("height", document.defaultView.innerHeight)
		element.style.setProperty("width", document.defaultView.innerWidth)
	}
	
}

function place_at_random(objs, rect) {
	let placeds = [];
	for (let k in objs) {
		let obj = objs[k];
		var tries = 30;
		while (tries > 0) {
			obj.x = randomInt(0, rect.width - obj.width);
			obj.y = randomInt(0, rect.height - obj.height);
			var ok = true;
			for (let j in placeds) {
				if (is_touching(obj, placeds[j])) {
					ok = false;
					break;
				}
			}
			if (ok) {
				placeds.push(obj);
				break;
			}
			tries -= 1;
		}
	}
}

function pick_a_empty_place_near(obj, objs, radius) {
	var tries = 30;
	let radius_decay = Math.max(1, (radius - obj.width/2) / tries);
	while (tries > 0) {
		let d = {
			x: randomSignal() * randomInt(1, radius),
			y: randomSignal() * randomInt(1, radius)
		};
		let new_pos = {
			x: obj.x + d.x,
			y: obj.y + d.y,
		};		
		//console.log(pos);
		var ok = true;
		for (let j in objs) {
			if (objs[j] === obj) {
				continue;
			}
			if (is_touching(new_pos, objs[j])) {
				ok = false;
				break;
			}
		}
		if (ok) {
			return d;
			break;
		}
		tries -= 1;
		radius -= radius_decay;
	}
}

function avoid_collisions(objs) {
	for (let i in objs) {		
		for (let j in objs) {
			if (i === j) {
				continue;
			}
			if (is_touching(objs[i], objs[j])) {
				let sx = randomSignal();
				let sy = randomSignal();
				objs[i].vx *= sx;
				objs[i].vy *= sy;
				objs[j].vx *= -sx;
				objs[j].vy *= -sy;
			}
		}
	}		    	
}

function sort_by_nearest(obj, objs) {	
	let aux = objs.slice();
	aux.sort(function (obj1, obj2) {
		let dx1 = (obj.x + obj.width/2) - (obj1.x + obj1.width/2);
		let dy1 = (obj.y + obj.height/2) - (obj1.y + obj1.height/2);
		let d1 = dx1*dx1 + dy1*dy1;

		let dx2 = (obj.x + obj.width/2) - (obj2.x + obj2.width/2);
		let dy2 = (obj.y + obj.height/2) - (obj2.y + obj2.height/2);
		let d2 = dx2*dx2 + dy2*dy2;
		
		if (d1 < d2) {
			return -1;
		} else if (d1 === d2) {
			return 0;
		} else {
			return 1;
		}
	});
	//console.log("nearest", obj.id, aux[0].id);
	return aux;
}