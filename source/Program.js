$("#projectAnchor").click(function() {
	var program = new Program();
	program.start();
});

function Program () {	
	this.view = new View();
	
	this.vertexShader = new VertexShaderFactory().shader;
	this.fragmentShader = new FragmentShaderFactory().shader;
	
	this.textureLoader = new TextureLoader();
	this.modelLoader = new ModelLoader();
	
	this.lights = [];
	this.cameras = [];
	this.currentCamera = 0;
	this.objectsToDraw = [];
	
	this.keyBuffer = [];
	
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
};

Program.prototype = {
	start: function() {
		this.view.constructGUI();
		this.lastTime = (new Date()).getTime();
		this.rotation = 0;

		this.initgl();
		this.vertexShader = this.loadShader("vertexShader");
		this.fragmentShader = this.loadShader("fragmentShader");
		this.initShaders();

		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.enable(this.gl.DEPTH_TEST);

		this.lastMouseXPos = 0;
		this.lastMouseYPos = 0;
		this.mouseDown = false;
		this.eventHandler = new EventHandler(this);

		this.createProjectionMatrix();

		this.modelsToLoad = [
			"model49",
			"model0",
			"basic-4pyramid", //as second light source
			"basic-4pyramid", //as first light source
			"camera-cube", //as camera2
			"camera-cube", //as camera1
		];
		
		this.loadTextures();
	},
	
	initgl: function() {
		try {
			this.gl = this.view.getCanvas().getContext("experimental-webgl");
		} catch (e) {
			console.log("Couldn't initialise GL context" + e.message);
		}

		this.vertexPositionBuffer = this.gl.createBuffer();
		this.vertexNormalBuffer = this.gl.createBuffer();
		this.textureCoordBuffer = this.gl.createBuffer();
		this.vertexIndexBuffer = this.gl.createBuffer();
	},
	
	loadShader: function(shaderType) {
		var shaderScript = this[shaderType];
		var shader;

		if(shaderType === "vertexShader") {
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		} else if (shaderType === "fragmentShader") {
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		}

		this.gl.shaderSource(shader, shaderScript);
		this.gl.compileShader(shader, shaderScript);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.log(this.gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	},
	
	initShaders: function() {
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, this.vertexShader);
		this.gl.attachShader(this.shaderProgram, this.fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}
		this.gl.useProgram(this.shaderProgram);	
	},
	
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
		
		var projectionMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
		this.gl.uniformMatrix4fv(projectionMatrixUniformLoc, this.gl.FALSE, projectionMatrix);
	},
	
	passViewMatrix: function(viewMatrix) {
		var viewMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "viewMatrix");
		this.gl.uniformMatrix4fv(viewMatrixUniformLoc, this.gl.FALSE, viewMatrix);
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
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
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
		var ambientProductUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "ambientProduct");
		this.gl.uniform4fv(ambientProductUniformLoc, ambientProduct);

		//diffuse product
		var diffuseProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.diffuse, sceneObject.reflectionDiffuse);
		diffuseProduct = vec4.fromValues(diffuseProduct[0], diffuseProduct[1], diffuseProduct[2], 1.0);
		var diffuseProductUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "diffuseProduct");
		this.gl.uniform4fv(diffuseProductUniformLoc, diffuseProduct);

		//light position
		var lightPositionUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "lightPosition");
		this.gl.uniform4fv(lightPositionUniformLoc, this.lights[0].getPosition());
	},
	
	prepareObjectTexture: function(glTexture) {
		this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
	},
	
	fillBuffers: function(sceneObject) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, sceneObject.getFloatVertices(), this.gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = sceneObject.getFloatVertices().length/3;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, sceneObject.getFloatVertexNormals(), this.gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = sceneObject.getFloatVertexNormals().length/3;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, sceneObject.getFloatTextureCoords(), this.gl.STATIC_DRAW);
		this.textureCoordBuffer.itemSize = 2;
		this.textureCoordBuffer.numItems = sceneObject.getFloatTextureCoords().length/2;

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sceneObject.getFaces()), this.gl.STATIC_DRAW);
		this.vertexIndexBuffer.numItems = sceneObject.getFaces().length;
	},
	
	initialiseAttributes: function() {
		this.vertexPositionAttributeLocation = this.initialseArrayBuffer(this.vertexPositionBuffer, "position");
		this.vertexNormalAttributeLocation = this.initialseArrayBuffer(this.vertexNormalBuffer, "normal");
		this.vertexTextureCoordAttributeLocation = this.initialseArrayBuffer(this.textureCoordBuffer, "texCoord");
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	},
	
	initialseArrayBuffer: function(buffer, attributeName) {
		var attributeLocation = this.gl.getAttribLocation(this.shaderProgram, attributeName);
		this.gl.enableVertexAttribArray(attributeLocation);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.vertexAttribPointer(attributeLocation, buffer.itemSize, this.gl.FLOAT, false, 0, 0);
		return attributeLocation;
	},
	
	drawObject: function(modelViewMatrix) {	
		var modelViewMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "modelMatrix");
		this.gl.uniformMatrix4fv(modelViewMatrixUniformLoc, this.gl.FALSE, modelViewMatrix);
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
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