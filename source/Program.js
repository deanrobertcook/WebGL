var htmlAnchorTag = "projectAnchor";

$("#" + htmlAnchorTag).click(function() {
	var program = new Program();
	program.start();
});

function Program () {
	this.canvasHeight = 500;//window.innerHeight;
	this.canvasWidth = 700; //window.innerWidth;
	
	this.lights = [];
	this.maxLights = 2;
	this.cameras = [];
	this.currentCamera = 0;
	this.objectsToDraw = [];
	
	this.vertexShader = 
		"attribute vec3 position;" +
		"attribute vec3 normal;" +
		"attribute vec2 texCoord;" +
		
		"uniform vec4 lightPositions[" + this.maxLights +"];" +
		"uniform mat4 modelMatrix;" +
		"uniform mat4 viewMatrix;" +
		"uniform mat4 projectionMatrix;" +
		
		"varying vec3 n;" +
		"varying vec3 l[" + this.maxLights +"];" +
		//"varying float lightDistances[" + this.maxLights +"];" +
		"varying vec2 vTexCoord;" +
		
		"void main() {" +
			"vTexCoord = texCoord;"+
			"mat4 modelView = viewMatrix * modelMatrix;" +
			
			"vec4 normalCamCoords = modelView * vec4(normal, 0.0);" +
			"n = normalize(normalCamCoords.xyz);" +
			
			"vec4 positionCamCoords = modelView * vec4(position, 1.0);" +
			"for (int i = 0; i < " + this.maxLights +"; i++) {" +
				//"lightDistances[i] = distance(lightPositions[i], vec4(position, 1.0));" +
				"vec4 lightPositionCamCoords = viewMatrix * lightPositions[i];" +
				"l[i] = normalize(lightPositionCamCoords.xyz - positionCamCoords.xyz);" +
			"}" +
			
			"gl_Position = projectionMatrix * positionCamCoords;" +
		"}";
	this.fragmentShader = 
		"precision mediump float;" +
		
		"uniform vec4 ambientProduct[" + this.maxLights +"];" +
		"uniform vec4 diffuseProduct[" + this.maxLights +"];" +
		"uniform sampler2D texture;" +
		
		"varying vec3 n;" +
		"varying vec3 l[" + this.maxLights +"];" +
		//"varying float lightDistances[" + this.maxLights +"];" +
		"varying vec2 vTexCoord;" +
		
		"void main() {" +
			"vec4 color = vec4(0.0, 0.0, 0.0, 1.0);" +
			
			"for (int i = 0; i < " + this.maxLights +"; i++) {" +
				//"float lightAttenuation = pow(max(0.0, 1.0 - lightDistances[i] / 20.0), 3.0);" +	
				"vec4 ambient = ambientProduct[i];" +
				"vec4 diffuse = max(dot(l[i], n), 0.0) * diffuseProduct[i];" +
				"color += ambient + diffuse;" +
			"}" + 
			
			"gl_FragColor = color * texture2D(texture, vTexCoord * 2.0);" +
		"}";
	
	this.textureLoader = new TextureLoader();
	this.modelLoader = new ModelLoader();
	
	this.keyBuffer = [];
	
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
};

Program.prototype = {
	start: function() {
		this.windowSetup();
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
	
	windowSetup: function() {
		this.appArea = $("<div id='CITS3200Project'></div>");
		this.canvasSetup();
		this.menuSetup();
		this.appArea = this.appArea.get(0);
		$("#" + htmlAnchorTag).after(this.appArea);
	},
	
	canvasSetup: function() {
		this.canvas = $("<canvas id='projectCanvas'><canvas>");
		$(this.canvas).attr({width: this.canvasWidth, height: this.canvasHeight});
		$(this.canvas).css({
			border: "1px solid black",
			resize: "both",
			display: "block",
			float: "left",
		});
		this.canvas = this.canvas.get(0);
		this.appArea.append(this.canvas);
	},
	
	menuSetup: function() {
		this.menu = $("<nav id='projectMenu'></nav>");
		this.menu.css({
			height: this.canvasHeight + "px",
			width: "150px",
			border: "1px solid black",
			"border-left": 0,
			display: "inline",
			float: "left",
		});
		
		
		var lightCamToggle = $("<button> Light/Cam Toggle</button>");
		
		var handleButtonClick = function() {
			if(this.modelInFocus === this.cameras[this.currentCamera]) {
				this.modelInFocus = this.lights[0];
			} else if(this.modelInFocus === this.lights[0]) {
				this.modelInFocus = this.cameras[this.currentCamera];
			}
		};
		
		lightCamToggle.click(handleButtonClick.bind(this)	);
		
		this.menu.append(lightCamToggle);
		this.menu = this.menu.get(0);
		this.appArea.append(this.menu);
	},
	
	initgl: function() {
		try {
			this.gl = this.canvas.getContext("experimental-webgl");
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
			aspectRatio	= this.canvas.clientWidth/this.canvas.clientHeight,
			clipHeight	= 2 * nearDist,
			zScale = 0.002;
	
		if (this.canvas.clientWidth <= this.canvas.clientHeight) {
			//including the aspect ratio here locks the width in place and forces the height to change
			fovy = 2 * Math.atan(clipHeight/(2 * nearDist * aspectRatio)); 
		} else {
			//or else the width changes with a fixed height
			fovy = 2 * Math.atan(clipHeight/(2 * nearDist)); 
		}
		mat4.perspective(projectionMatrix, fovy, aspectRatio, nearDist, farDist);
		
//		mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -1.0]);
//		mat4.scale(projectionMatrix, projectionMatrix, [1.0, 1.0, zScale]);
//		mat4.translate(projectionMatrix, projectionMatrix, [0, 0, 1.0]);
		
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
		sceneObjects[3].lightSource.increaseDiffuse(1.0, 0, 0);
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
		var lights = this.lights,
			ambientProducts = [],
			diffuseProducts = [],
			lightPositions = [];
		
		for (var i = 0, l = lights.length; i < l; i++) {
			var ambientProduct = vec3.multiply(vec3.create(), this.lights[i].lightSource.ambient, sceneObject.reflectionAmbient);
			ambientProducts.push(ambientProduct[0]);
			ambientProducts.push(ambientProduct[1]);
			ambientProducts.push(ambientProduct[2]);
			ambientProducts.push(1.0);
				
			var diffuseProduct = vec3.multiply(vec3.create(), this.lights[0].lightSource.diffuse, sceneObject.reflectionDiffuse);
			diffuseProducts.push(diffuseProduct[0]);
			diffuseProducts.push(diffuseProduct[1]);
			diffuseProducts.push(diffuseProduct[2]);
			diffuseProducts.push(1.0);
			
			lightPositions.push(lights[i].getPosition()[0]);
			lightPositions.push(lights[i].getPosition()[1]);
			lightPositions.push(lights[i].getPosition()[2]);
			lightPositions.push(lights[i].getPosition()[3]);
		}
		
//		console.log(ambientProducts);
//		console.log(diffuseProducts);
//		console.log(new Float32Array(lightPositions));
		
		var ambientProductUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "ambientProduct");
		this.gl.uniform4fv(ambientProductUniformLoc, new Float32Array(ambientProducts));
		
		var diffuseProductUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "diffuseProduct");
		this.gl.uniform4fv(diffuseProductUniformLoc, new Float32Array(diffuseProducts));

		var lightPositionUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "lightPosition");
		this.gl.uniform4fv(lightPositionUniformLoc, new Float32Array(lightPositions));
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
