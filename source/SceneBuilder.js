var SceneBuilder = (function() {
	var private = {
		lights: [],
		cameras: [],
		currentCamera: 0,
		
		modelsToLoad: [ //filled out with a basic scene
			"basic-cube-forward",
			"camera-cube-left", 
			"camera-cube-back", 
			"basic-4pyramid-light", 
		],
		modelsLoaded: [],
		modelInFocus: null,
		
		modelFactory: null,
		textureLoader: null,
	};
	
	function SceneBuilder() {
		private.modelFactory = new ModelFactory();
		private.textureLoader = new TextureLoader();
	}

	SceneBuilder.prototype = {
		getScene: function(canvas) {
			var viewMatrix = private.cameras[private.currentCamera].getViewMatrix();
			var projectionMatrix = this.createProjectionMatrix(canvas);
			this.prepareModelColor();
			
			var scene = {
				viewMatrix: viewMatrix,
				projectionMatrix: projectionMatrix,
				sceneModels: private.modelsLoaded,
				
			}
			return scene;
		},
		
		getModelInFocus: function() {
			return private.cameras[private.currentCamera];
		},
		
		prepareModelColor: function() {
			var sceneModels = private.modelsLoaded;
			for (var i = 0, l = sceneModels.length; i < l; i++) {
				var model = sceneModels[i];
				model.lightUniforms = this.createLightUniforms(model);
				if (!model.textureIsLoaded()) {
					private.textureLoader.loadTextureFor(model);
				}
			}
		},

		addModelToScene: function(modelName) {
			private.modelsToLoad.push(modelName);
		},
		
		cycleNextCamera: function () {
			var numCameras = private.cameras.length;
			private.currentCamera = (private.currentCamera + 1) % numCameras;
		},
		
		printCameras: function() {
			console.log(private.cameras);
			console.log("Current Camera: " + private.currentCamera);
		},

		deleteModelFromScene: function(modelIndex) {
			private.modelsLoaded.splice(modelIndex, 1);
		},

		handleModel: function(model) {
			if (model.isLightSource()) {
				private.lights.push(model);
			} if (model.isCamera()) {
				private.cameras.push(model);
			}
			private.modelsLoaded.push(model);
		},

		loadModels: function() {
			if (private.modelsToLoad.length > 0) {
				var model = private.modelsToLoad.pop();
				private.modelFactory.loadModel(model, this.handleModel.bind(this));
			}
		},

		createProjectionMatrix: function(canvas) {
			var projectionMatrix = mat4.create();
			var nearDist	= 0.01,
				farDist		= 500,
				fovy = 45,
				aspectRatio	= canvas.clientWidth/canvas.clientHeight;
			mat4.perspective(projectionMatrix, fovy, aspectRatio, nearDist, farDist);
			return projectionMatrix;
		},

		createLightUniforms: function(model) {
			//ambient product
			var ambientProduct = vec3.multiply(vec3.create(), private.lights[0].lightSource.ambient, model.reflectionAmbient);
			ambientProduct = vec4.fromValues(ambientProduct[0], ambientProduct[1], ambientProduct[2], 1.0);

			//diffuse product
			var diffuseProduct = vec3.multiply(vec3.create(), private.lights[0].lightSource.diffuse, model.reflectionDiffuse);
			diffuseProduct = vec4.fromValues(diffuseProduct[0], diffuseProduct[1], diffuseProduct[2], 1.0);

			//light position
			var lightPosition = private.lights[0].getPosition();

			return {
				ambientProduct: ambientProduct,
				diffuseProduct: diffuseProduct,
				lightPosition: lightPosition
			};
		},
	};
	return SceneBuilder;
})();
