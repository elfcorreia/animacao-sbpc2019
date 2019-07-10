class PlayDataAdapter {		

	// called every new game
	getEpitopo() {
		let aa = "ARNDCQEGHILKMFPSTWYV";
		let LENGTH = 9;
		var epitope = "";
		for (let i = 0; i < LENGTH; i++) {
			epitope += aa[parseInt(Math.random() * aa.length)];
		}

		this.ground_true = Math.random() < 0.5;
		this.algorithm_choice = Math.random() < 0.5;
		return epitope;
	}

	// has imuno response? true or false
	getGroundTrue() {
		return this.ground_true;
	}

	// has imuno response? true or false
	getAlgorithmChoice() {
		return this.algorithm_choice;
	}

}