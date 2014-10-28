$("#projectAnchor").click(function() {
	window.controller = new Controller();
});

function Controller () {
	this._ = {
		view: null,
		gl: null,
		sceneBuilder: null,
		inputHandler: null,

		frame: 0,
		lastTime: null,

		loopLimit: 50,
		loops: 0,
		limitLoops: false,
	};
	this._.view = new View();
	this._.sceneBuilder = new SceneBuilder();
	this._.gl = new GLProgram(this._.view.getCanvas());
	
	this._.view.produceMenuButton("Add Object", this.handleAddObjectButtonClick.bind(this));
	this._.view.produceMenuButton("Remove Selected Object", this.handleRemoveObjectButtonClick.bind(this));
	this._.view.produceMenuButton("Selected Object as Camera", this.handleChangeCameraClick.bind(this));
	this._.view.produceMenuButton("Reset Current Camera as Selected", this.handleResetCurrentAsCameraClick.bind(this));
	this._.view.produceMenuButton("Test Button", this.testButtonFunction.bind(this));
	this._.view.assembleGUI();

	this._.inputHandler = new InputHandler(this, this._.view.getCanvas());		
	this._.lastTime = (new Date()).getTime();
	
	requestAnimationFrame(this.mainLoop.bind(this));
};

Controller.prototype = {		
	testButtonFunction: function() {
		
	},

	handleAddObjectButtonClick: function() {
		var newMesh = prompt("Enter an object mesh file name: ");
		this._.sceneBuilder.addModelToScene(newMesh);
	},

	handleRemoveObjectButtonClick: function() {
		this._.sceneBuilder.deleteSelectedModel();
	},
	
	handleChangeCameraClick: function() {
		this._.sceneBuilder.setSelectedModelAsCamera();
	},
	
	handleResetCurrentAsCameraClick: function() {
		this._.sceneBuilder.setSelectedModel();
	},

	mainLoop: function() {
		if ((this._.loops < this._.loopLimit) || !this._.limitLoops) {
			window.requestAnimationFrame(this.mainLoop.bind(this));
		}
		this._.sceneBuilder.loadModels();
		var scene = this._.sceneBuilder.getScene(this._.view.getCanvas());
		this._.gl.drawScene(scene);

		var elapsedTime = this.getElapsedTimeInSeconds();
		if (this._.frame > 30) {
			var refreshRate = this.getRefreshRate(elapsedTime);
			this._.view.updateRefreshRateDisplay(refreshRate);
			this._.frame = 0;
		}
		this._.frame++;
		this._.loops++;
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

	/* 
	 * User input controls 
	 */

	keyW: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(0, 0, -2);
	},

	keyA: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(-2, 0, 0);
	},

	keyS: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(0, 0, 2);
	},

	keyD: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(2, 0, 0);
	},

	keyQ: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(0, 2, 0);
	},

	keyE: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.translate(0, -2, 0);
	},

	keyO: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.lookAtPosition(0, 0, 0);
	},

	keyUp: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateX(10);
	},

	keyDown: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateX(-10);
	},

	keyLeft: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateY(10);
	},

	keyRight: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateY(-10);
	},

	keysShiftAndLeft: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateZ(10);
	},

	keysShiftAndRight: function() {
		var model = this._.sceneBuilder.getSelectedModel();
		model.rotateZ(-10);
	},
	
	mouseDown: function(mousePosition) {
		if (mousePosition.button === 0) {
			var scene = this._.sceneBuilder.getScene(this._.view.getCanvas());
			var modelIndex = this._.gl.modelAt(mousePosition.x, mousePosition.y, scene);
			this._.sceneBuilder.setSelectedModel(modelIndex);
		}
	},
	
	mouseUp: function(mousePosition) {
		//console.log(mousePosition);
	},
	
	mouseMove: function(mousePosition) {
		//console.log(mousePosition);
	},
};