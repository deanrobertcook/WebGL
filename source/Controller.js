$("#projectAnchor").click(function() {
	new Controller();
});

var Controller = (function() {
	var private = {
		view: null,
		gl: null,
		sceneBuilder: null,
		eventHandler: null,
	};
	
	function Controller () {
		private.view = new View();
		private.gl = new GLContext(private.view.getCanvas());
		private.sceneBuilder = new SceneBuilder();
		
		this.lastTime = (new Date()).getTime();

		private.view = new View();
		private.view.produceMenuButton("Light/Cam Toggle", this.handleToggleClick.bind(this));
		private.view.produceMenuButton("Add Object", this.handleAddObjectButtonClick.bind(this));
		private.view.produceMenuButton("Remove Object", this.handleRemoveObjectButtonClick.bind(this));
		private.view.produceMenuButton("Next Cam", private.sceneBuilder.cycleNextCamera);
		private.view.produceMenuButton("Test Button", this.testButtonFunction.bind(this));
		private.view.assembleGUI();

		private.gl = new GLContext(private.view.getCanvas());

		private.sceneBuilder = new SceneBuilder();
		private.eventHandler = new EventHandler(this);		

		this.frame = 0;

		//debug
		this.loopLimit = 50;
		this.loops = 0;
		this.limitLoops = false;

		this.mainLoop();
	};
	
	Controller.prototype = {
		testButtonFunction: function() {
			console.log(private.sceneBuilder.getScene(private.view.getCanvas()));
		},
		receiveUserCommand: function(command) {
			console.log(command);
		},
		
		handleToggleClick: function() {
			if(this.modelInFocus === this.cameras[this.currentCamera]) {
				this.modelInFocus = this.lights[0];
			} else if(this.modelInFocus === this.lights[0]) {
				this.modelInFocus = this.cameras[this.currentCamera];
			}
		},

		handleAddObjectButtonClick: function() {
			var newMesh = prompt("Enter an object mesh file name: ");
			private.sceneBuilder.addModelToScene(newMesh);
		},

		handleRemoveObjectButtonClick: function() {
			var modelIndex = prompt("Enter the index of the model to be removed: ");
			private.sceneBuilder.deleteModelFromScene(modelIndex);
		},

		mainLoop: function() {
			if ((this.loops < this.loopLimit) || !this.limitLoops) {
				window.requestAnimationFrame(this.mainLoop.bind(this));
			}

			private.sceneBuilder.loadModels();
			var scene = private.sceneBuilder.getScene(private.view.getCanvas());
			private.gl.drawScene(scene);

			var elapsedTime = this.getElapsedTimeInSeconds();
			if (this.frame > 30) {
				var refreshRate = this.getRefreshRate(elapsedTime);
				private.view.updateRefreshRateDisplay(refreshRate);
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
	return Controller;
})();