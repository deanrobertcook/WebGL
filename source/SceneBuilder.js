function SceneBuilder() {
	this._ = {
		lights: [], 

		modelsToLoad: [ //filled out with a basic scene
			"basic-cube-forward",
			"camera-cube-left",  
			"basic-4pyramid-light",
			"camera-cube-back",
		],
		modelsLoaded: [],
		selectedModel: null,
		currentCamera: null,

		modelFactory: null,
		textureLoader: null,
	};

	this._.modelFactory = new ModelFactory();
	this._.textureLoader = new TextureLoader();
}

SceneBuilder.prototype = {
	getScene: function(canvas) {
		var viewMatrix = this._.currentCamera.getViewMatrix();
		var projectionMatrix = this.createProjectionMatrix(canvas);
		this.prepareModelColor();

		var scene = {
			viewMatrix: viewMatrix,
			projectionMatrix: projectionMatrix,
			sceneModels: this._.modelsLoaded,
		}
		return scene;
	},
	
	setSelectedModel: function(modelIndex) {
		modelIndex = modelIndex >= 0 ? modelIndex : this._.modelsLoaded.indexOf(this._.currentCamera);
		this._.selectedModel = this._.modelsLoaded[modelIndex];
	},
	
	getSelectedModel: function() {
		return this._.selectedModel;
	},
	
	setSelectedModelAsCamera: function() {
		if (this._.selectedModel.isCamera()) {
			this._.currentCamera = this.getSelectedModel();
		} else {
			console.log("Object not suitable as camera.");
		}
	},
	
	prepareModelColor: function() {
		var sceneModels = this._.modelsLoaded;
		for (var i = 0, l = sceneModels.length; i < l; i++) {
			var model = sceneModels[i];
			model.lightUniforms = this.createLightUniforms(model);
			if (!model.textureIsLoaded()) {
				this._.textureLoader.loadTextureFor(model);
			}
		}
	},

	addModelToScene: function(modelName) {
		this._.modelsToLoad.push(modelName);
	},

	deleteSelectedModel: function() {
		if (this._.selectedModel === this._.currentCamera) {
			console.log("Can't delete current camera model.");
		} else {
			var modelIndex = this._.modelsLoaded.indexOf(this._.selectedModel);
			this._.modelsLoaded.splice(modelIndex, 1);
			this.setSelectedModel();
		}
	},

	handleModel: function(model) {
		this._.modelsLoaded.push(model);
		
		if(!this._.selectedModel) {
			this.setSelectedModel(0);
		}
		
		if(!this._.currentCamera) {
			this.setSelectedModelAsCamera();
		}
		
		if (model.isLightSource()) {
			this._.lights.push(model);
		}
	},

	loadModels: function() {
		if (this._.modelsToLoad.length > 0) {
			var model = this._.modelsToLoad.pop();
			this._.modelFactory.loadModel(model, this.handleModel.bind(this));
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
		var ambientProduct = vec3.multiply(vec3.create(), this._.lights[0].lightSource.ambient, model.reflectionAmbient);
		ambientProduct = vec4.fromValues(ambientProduct[0], ambientProduct[1], ambientProduct[2], 1.0);

		//diffuse product
		var diffuseProduct = vec3.multiply(vec3.create(), this._.lights[0].lightSource.diffuse, model.reflectionDiffuse);
		diffuseProduct = vec4.fromValues(diffuseProduct[0], diffuseProduct[1], diffuseProduct[2], 1.0);

		//light position
		var lightPosition = this._.lights[0].getPosition();

		return {
			ambientProduct: ambientProduct,
			diffuseProduct: diffuseProduct,
			lightPosition: lightPosition
		};
	},
};