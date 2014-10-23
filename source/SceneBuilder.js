function SceneBuilder() {
	this.lights = [];
	this.cameras = [];
	this.currentCamera = 0;
	
	this.modelsToLoad = [ //filled out with a basic scene
		"basic-cube-forward",
		"camera-cube-back", 
		"basic-4pyramid-light", 
	];
	this.modelsLoaded = [];
	
	this.modelFactory = new ModelFactory();
}

SceneBuilder.prototype = {
	drawScene: function(glContext, canvas) {	
		if (this.cameras.length > 0) {
			var camera = this.cameras[this.currentCamera];
			glContext.passViewMatrix(camera.getViewMatrix());
		}
		
		glContext.clearViewport();
		
		var projectionMatrix = this.createProjectionMatrix(canvas);
		glContext.passProjectionMatrix(projectionMatrix);
		
		var sceneModels = this.modelsLoaded;
		
		for (var i = 0, l = sceneModels.length; i < l; i++) {
			glContext.passLightUniforms(
					this.createLightUniforms(sceneModels[0]));
			glContext.fillBuffers(sceneModels[i]);
			glContext.initialiseAttributes();
			glContext.drawObject(sceneModels[i].getModelMatrix());
		}
	},
	
	addModelToScene: function(modelName) {
		this.modelsToLoad.push(modelName);
	},
	
	deleteModelFromScene: function(modelIndex) {
		this.modelsLoaded.splice(modelIndex, 1);
	},
	
	handleModel: function(model) {
		if (model.isLightSource()) {
			this.lights.push(model);
		} if (model.isCamera()) {
			this.cameras.push(model);
		}
		this.modelsLoaded.push(model);
	},
	
	loadModels: function() {
		if (this.modelsToLoad.length > 0) {
			var model = this.modelsToLoad.pop();
			this.modelFactory.loadModel(model, this.handleModel.bind(this));
		}
	},
	
	createProjectionMatrix: function(canvas) {
		var projectionMatrix = mat4.create();
		var nearDist	= 0.01,
			farDist		= 500,
			fovy = 45,
			aspectRatio	= canvas.clientWidth/canvas.clientHeight,
			clipHeight	= 2 * nearDist;
	
//		if (canvas.clientWidth <= canvas.clientHeight) {
//			//including the aspect ratio here locks the width in place and forces the height to change
//			fovy = 2 * Math.atan(clipHeight/(2 * nearDist * aspectRatio)); 
//		} else {
//			//or else the width changes with a fixed height
//			fovy = 2 * Math.atan(clipHeight/(2 * nearDist)); 
//		}
		mat4.perspective(projectionMatrix, fovy, aspectRatio, nearDist, farDist);
		return projectionMatrix;
	},
	
	createLightUniforms: function(model) {
		//ambient product
		var ambientProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.ambient, model.reflectionAmbient);
		ambientProduct = vec4.fromValues(ambientProduct[0], ambientProduct[1], ambientProduct[2], 1.0);
		
		//diffuse product
		var diffuseProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.diffuse, model.reflectionDiffuse);
		diffuseProduct = vec4.fromValues(diffuseProduct[0], diffuseProduct[1], diffuseProduct[2], 1.0);
		
		//light position
		var lightPosition = this.lights[0].getPosition();
		
		return {
			ambientProduct: ambientProduct,
			diffuseProduct: diffuseProduct,
			lightPosition: lightPosition
		};
	},
};