$("#projectAnchor").click(function() {
	new Program();
});

function Program () {	
	this.view = new View();
	this.view.constructGUI();
	
	this.lastTime = (new Date()).getTime();
	this.rotation = 0;
	
	this.gl = new GLContext(this.view.getCanvas());
	this.gl.gl().clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.gl().enable(this.gl.gl().DEPTH_TEST);
	
	this.textureLoader = new TextureLoader();
	this.modelLoader = new ModelLoader();
	
	this.lastMouseXPos = 0;
	this.lastMouseYPos = 0;
	this.mouseDown = false;
	this.eventHandler = new EventHandler(this);
	
	this.lights = [];
	this.cameras = [];
	this.currentCamera = 0;
	this.objectsToDraw = [];
	
	this.modelsToLoad = [
		"model49",
		"model0",
		"basic-4pyramid", //as second light source
		"basic-4pyramid", //as first light source
		"camera-cube", //as camera2
		"camera-cube", //as camera1
	];
	
	this.keyBuffer = [];
	
	this.createProjectionMatrix();
	
	this.loadTextures();
};

Program.prototype = {
	createProjectionMatrix: function() {
		var projectionMatrix = mat4.create();
		var nearDist	= 0.01,
			farDist		= 100,
			fovy,
			aspectRatio	= this.view.getCanvas().clientWidth/this.view.getCanvas().clientHeight,
			clipHeight	= 2 * nearDist,
			zScale = 0.002;
	
		if (this.view.getCanvas().clientWidth <= this.view.getCanvas().clientHeight) {
			//including the aspect ratio here locks the width in place and forces the height to change
			fovy = 2 * Math.atan(clipHeight/(2 * nearDist * aspectRatio)); 
		} else {
			//or else the width changes with a fixed height
			fovy = 2 * Math.atan(clipHeight/(2 * nearDist)); 
		}
		mat4.perspective(projectionMatrix, fovy, aspectRatio, nearDist, farDist);
		
		var projectionMatrixUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "projectionMatrix");
		this.gl.gl().uniformMatrix4fv(projectionMatrixUniformLoc, this.gl.gl().FALSE, projectionMatrix);
	},
	
	passViewMatrix: function(viewMatrix) {
		var viewMatrixUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "viewMatrix");
		this.gl.gl().uniformMatrix4fv(viewMatrixUniformLoc, this.gl.gl().FALSE, viewMatrix);
	},
	
	loadTextures: function() {
		if (this.textureLoader.texturesToLoad.length > 0) {
			var textureFileName = this.textureLoader.texturesToLoad.pop();
			this.textureLoader.loadTextureAsWebGLTexture(textureFileName, this);
		} else {
			this.loadModels();
		}
	},
	
	loadModels: function() {
		if (this.modelsToLoad.length > 0) {
			var model = this.modelsToLoad.pop();
			this.modelLoader.loadModel(model, this);
		} else {
			this.setUpModels();
		}
	},
	
	setUpModels: function() {
		var sceneObjects = this.modelLoader.getModels();
	
		//camera 1
		sceneObjects[0].translate(0, 0, 8);
		this.cameras.push(sceneObjects[0]);
		this.objectsToDraw.push(sceneObjects[0]);
		
		//camera 2
		sceneObjects[1].translate(0, 0, -8);
		sceneObjects[1].rotateY(180);
		this.cameras.push(sceneObjects[1]);
		this.objectsToDraw.push(sceneObjects[1]);
		
		this.modelInFocus = this.cameras[this.currentCamera];
		
		//light source 1
		sceneObjects[2].setAsLightSource();
		sceneObjects[2].scale(0.5, 0.5, 0.5);
		sceneObjects[2].translate(5, 0, 0);
		this.lights.push(sceneObjects[2]);
		this.objectsToDraw.push(sceneObjects[2]);
		
		//light source 2
		sceneObjects[3].setAsLightSource();
		sceneObjects[3].scale(0.5, 0.5, 0.5);
		sceneObjects[3].translate(-5, 0, 0);
		this.lights.push(sceneObjects[3]);
		this.objectsToDraw.push(sceneObjects[3]);
		
		//floor
		sceneObjects[4].translate(0, -1.01, 0);
		sceneObjects[4].scale(10, 10, 10);
		sceneObjects[4].rotateX(90);
		this.objectsToDraw.push(sceneObjects[4]);
		
		//object1
		sceneObjects[5].scale(0.1, 0.1, 0.1);
		this.objectsToDraw.push(sceneObjects[5]);
		
		this.mainLoop();
	},
	
	mainLoop: function() {
		window.requestAnimationFrame(this.mainLoop.bind(this));
		this.passViewMatrix(this.cameras[this.currentCamera].getViewMatrix());
		this.drawScene();

		var elapsedTime = this.getElapsedTimeInSeconds();
		var refreshRate = this.getRefreshRate(elapsedTime);
		this.updateRotation(elapsedTime);

		$("#displayCalls").remove();
		$(this.canvas).before("<p id='displayCalls'>Refresh Rate: " + refreshRate + "</p>");
		//$(this.canvas).goTo();
	},
	
	drawScene: function() {	
		this.gl.gl().viewport(0, 0, this.gl.gl().drawingBufferWidth, this.gl.gl().drawingBufferHeight);
		this.gl.gl().clear(this.gl.gl().COLOR_BUFFER_BIT | this.gl.gl().DEPTH_BUFFER_BIT);
	
		var sceneObjects = this.objectsToDraw;
		
		for (var i = 0, l = this.objectsToDraw.length; i < l; i++) {
			this.establishLightingModel(sceneObjects[i]);
			this.prepareObjectTexture(this.textureLoader.getGLTexture(0));
			this.fillBuffers(sceneObjects[i]);
			this.initialiseAttributes();
			this.drawObject(sceneObjects[i].getModelMatrix());
		}
	},
	
	establishLightingModel: function(sceneObject) {
		//ambient product
		var ambientProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.ambient, sceneObject.reflectionAmbient);
		ambientProduct = vec4.fromValues(ambientProduct[0], ambientProduct[1], ambientProduct[2], 1.0);
		var ambientProductUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "ambientProduct");
		this.gl.gl().uniform4fv(ambientProductUniformLoc, ambientProduct);

		//diffuse product
		var diffuseProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.diffuse, sceneObject.reflectionDiffuse);
		diffuseProduct = vec4.fromValues(diffuseProduct[0], diffuseProduct[1], diffuseProduct[2], 1.0);
		var diffuseProductUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "diffuseProduct");
		this.gl.gl().uniform4fv(diffuseProductUniformLoc, diffuseProduct);

		//light position
		var lightPositionUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "lightPosition");
		this.gl.gl().uniform4fv(lightPositionUniformLoc, this.lights[0].getPosition());
	},
	
	prepareObjectTexture: function(glTexture) {
		this.gl.gl().bindTexture(this.gl.gl().TEXTURE_2D, glTexture);
		this.gl.gl().activeTexture(this.gl.gl().TEXTURE0);
		this.gl.gl().uniform1i(this.gl.shaderProgram.samplerUniform, 0);
	},
	
	fillBuffers: function(sceneObject) {
		this.gl.gl().bindBuffer(this.gl.gl().ARRAY_BUFFER, this.gl.vertexPositionBuffer);
		this.gl.gl().bufferData(this.gl.gl().ARRAY_BUFFER, sceneObject.getFloatVertices(), this.gl.gl().STATIC_DRAW);
		this.gl.vertexPositionBuffer.itemSize = 3;
		this.gl.vertexPositionBuffer.numItems = sceneObject.getFloatVertices().length/3;

		this.gl.gl().bindBuffer(this.gl.gl().ARRAY_BUFFER, this.gl.vertexNormalBuffer);
		this.gl.gl().bufferData(this.gl.gl().ARRAY_BUFFER, sceneObject.getFloatVertexNormals(), this.gl.gl().STATIC_DRAW);
		this.gl.vertexNormalBuffer.itemSize = 3;
		this.gl.vertexNormalBuffer.numItems = sceneObject.getFloatVertexNormals().length/3;

		this.gl.gl().bindBuffer(this.gl.gl().ARRAY_BUFFER, this.gl.textureCoordBuffer);
		this.gl.gl().bufferData(this.gl.gl().ARRAY_BUFFER, sceneObject.getFloatTextureCoords(), this.gl.gl().STATIC_DRAW);
		this.gl.textureCoordBuffer.itemSize = 2;
		this.gl.textureCoordBuffer.numItems = sceneObject.getFloatTextureCoords().length/2;

		this.gl.gl().bindBuffer(this.gl.gl().ELEMENT_ARRAY_BUFFER, this.gl.vertexIndexBuffer);
		this.gl.gl().bufferData(this.gl.gl().ELEMENT_ARRAY_BUFFER, new Uint16Array(sceneObject.getFaces()), this.gl.gl().STATIC_DRAW);
		this.gl.vertexIndexBuffer.numItems = sceneObject.getFaces().length;
	},
	
	initialiseAttributes: function() {
		this.vertexPositionAttributeLocation = this.initialseArrayBuffer(this.gl.vertexPositionBuffer, "position");
		this.vertexNormalAttributeLocation = this.initialseArrayBuffer(this.gl.vertexNormalBuffer, "normal");
		this.vertexTextureCoordAttributeLocation = this.initialseArrayBuffer(this.gl.textureCoordBuffer, "texCoord");
		this.gl.gl().bindBuffer(this.gl.gl().ELEMENT_ARRAY_BUFFER, this.gl.vertexIndexBuffer);
	},
	
	initialseArrayBuffer: function(buffer, attributeName) {
		var attributeLocation = this.gl.gl().getAttribLocation(this.gl.shaderProgram, attributeName);
		this.gl.gl().enableVertexAttribArray(attributeLocation);
		this.gl.gl().bindBuffer(this.gl.gl().ARRAY_BUFFER, buffer);
		this.gl.gl().vertexAttribPointer(attributeLocation, buffer.itemSize, this.gl.gl().FLOAT, false, 0, 0);
		return attributeLocation;
	},
	
	drawObject: function(modelViewMatrix) {	
		var modelViewMatrixUniformLoc = this.gl.gl().getUniformLocation(this.gl.shaderProgram, "modelMatrix");
		this.gl.gl().uniformMatrix4fv(modelViewMatrixUniformLoc, this.gl.gl().FALSE, modelViewMatrix);
		this.gl.gl().drawElements(this.gl.gl().TRIANGLES, this.gl.vertexIndexBuffer.numItems, this.gl.gl().UNSIGNED_SHORT, 0);
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
	
	updateRotation: function(elapsedTime) {
		this.rotation += this.angularVelocity * elapsedTime;
		this.rotation %= 360;
	}
};