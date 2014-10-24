$("#projectAnchor").click(function() {
	new Controller();
});

function Controller () {	
	this.lastTime = (new Date()).getTime();
	
	this.view = new View(this);
	this.view.produceMenuButton("Light/Cam Toggle", this.handleToggleClick.bind(this));
	this.view.produceMenuButton("Add Object", this.handleAddObjectButtonClick.bind(this));
	this.view.produceMenuButton("Remove Object", this.handleRemoveObjectButtonClick.bind(this));
	this.view.assembleGUI();
	
	this.gl = new GLContext(this.view.getCanvas());

	this.sceneBuilder = new SceneBuilder();
	this.eventHandler = new EventHandler(this);
	
	this.keyBuffer = [];
	
	this.frame = 0;
	
	//debug
	this.loopLimit = 50;
	this.loops = 0;
	this.limitLoops = false;
	
	this.mainLoop();
};

Controller.prototype = {
	handleToggleClick: function() {
		if(this.modelInFocus === this.cameras[this.currentCamera]) {
			this.modelInFocus = this.lights[0];
		} else if(this.modelInFocus === this.lights[0]) {
			this.modelInFocus = this.cameras[this.currentCamera];
		}
	},
	
	handleAddObjectButtonClick: function() {
		var newMesh = prompt("Enter an object mesh file name: ");
		this.sceneBuilder.addModelToScene(newMesh);
	},
	
	handleRemoveObjectButtonClick: function() {
		var modelIndex = prompt("Enter the index of the model to be removed: ");
		this.sceneBuilder.deleteModelFromScene(modelIndex);
	},
	
	mainLoop: function() {
		if ((this.loops < this.loopLimit) || !this.limitLoops) {
			window.requestAnimationFrame(this.mainLoop.bind(this));
		}

		this.sceneBuilder.loadModels();
		this.sceneBuilder.drawScene(this.gl, this.view.getCanvas());

		var elapsedTime = this.getElapsedTimeInSeconds();
		if (this.frame > 30) {
			var refreshRate = this.getRefreshRate(elapsedTime);
			this.view.updateRefreshRateDisplay(refreshRate);
			this.frame = 0;
		}
		this.frame++;
		this.loops++;
	},
	
	getElapsedTimeInSeconds: function() {	
		var timeNow = (new Date()).getTime();
		var elapsedTime = timeNow - this.lastTime;
		this.lastTime = timeNow;
		return elapsedTime * 0.001;
	},
	
	getRefreshRate: function(elapsedTime) {
		var refreshRate = 1 / elapsedTime;
		return Math.floor(refreshRate);
	},
};