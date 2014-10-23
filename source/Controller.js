$("#projectAnchor").click(function() {
	new Controller();
});

function Controller () {	
	this.lastTime = (new Date()).getTime();
	
	this.view = new View(this);
	this.view.produceMenuButton("Light/Cam Toggle", this.handleToggleClick.bind(this));
	this.view.produceMenuButton("Add Object", this.handleAddObjectButtonClick.bind(this));
	this.view.assembleGUI();
	
	this.gl = new GLContext(this.view.getCanvas());

	this.sceneBuilder = new SceneBuilder();
	this.eventHandler = new EventHandler(this);
	
	this.keyBuffer = [];
	this.currentCamera = 0;
	
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
		this.program.modelsToLoad.push(newMesh);
	},
	
	mainLoop: function() {
		window.requestAnimationFrame(this.mainLoop.bind(this));

		this.sceneBuilder.loadModels();
		
		var camera = this.sceneBuilder.cameras[this.currentCamera];
		this.gl.passViewMatrix(camera.getViewMatrix());
		
		this.drawScene();

		var elapsedTime = this.getElapsedTimeInSeconds();
		var refreshRate = this.getRefreshRate(elapsedTime);

		$("#displayCalls").remove();
		$(this.canvas).before("<p id='displayCalls'>Refresh Rate: " + refreshRate + "</p>");
		this.loopCount++;
	},
	
	drawScene: function() {	
		this.gl.clearViewport();
		
		var projectionMatrix = this.sceneBuilder.createProjectionMatrix(this.view.getCanvas());
		this.gl.passProjectionMatrix(projectionMatrix);
		
		var sceneModels = this.sceneBuilder.modelsLoaded;
		
		for (var i = 0, l = sceneModels.length; i < l; i++) {
			this.gl.passLightUniforms(
					this.sceneBuilder.createLightUniforms(sceneModels[0]));
			this.gl.fillBuffers(sceneModels[i]);
			this.gl.initialiseAttributes();
			this.gl.drawObject(sceneModels[i].getModelMatrix());
		}
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