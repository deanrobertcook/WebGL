function GLContext(canvas) {
	this.gl;
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
	this.initGL(canvas);
	
	
	this.shaderProgram;
	this.shaderFactory = new ShaderFactory();
	this.vertexShader = this.shaderFactory.getGLShader("vertexShader", this.gl);
	this.fragmentShader = this.shaderFactory.getGLShader("fragmentShader", this.gl);
	this.initShaders();
	
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.enable(this.gl.DEPTH_TEST);
};

GLContext.prototype = {
	initGL: function(canvas) {
		try {
			this.gl = canvas.getContext("experimental-webgl");
		} catch (e) {
			console.log("Couldn't initialise GL context" + e.message);
		}

		this.vertexPositionBuffer = this.gl.createBuffer();
		this.vertexNormalBuffer = this.gl.createBuffer();
		this.textureCoordBuffer = this.gl.createBuffer();
		this.vertexIndexBuffer = this.gl.createBuffer();
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
	
	gl: function() {
		if (this.gl) {
			return this.gl;
		}
	},
	
	passProjectionMatrix: function(projectionMatrix) {
		var projectionMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
		this.gl.uniformMatrix4fv(projectionMatrixUniformLoc, this.gl.FALSE, projectionMatrix);
	},
	
	passViewMatrix: function(viewMatrix) {
		var viewMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "viewMatrix");
		this.gl.uniformMatrix4fv(viewMatrixUniformLoc, this.gl.FALSE, viewMatrix);
	},
	
	clearViewport: function() {
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	},
	
	passLightUniforms: function(lightUniforms) {
		$.each(lightUniforms, function(uniformName, uniformValue) {
			var UniformLoc = this.gl.getUniformLocation(this.shaderProgram, uniformName);
			this.gl.uniform4fv(UniformLoc, uniformValue);
		}.bind(this));
	},
	
	fillBuffers: function(model) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, model.getFloatVertices(), this.gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = model.getFloatVertices().length/3;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, model.getFloatVertexNormals(), this.gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = model.getFloatVertexNormals().length/3;

//		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
//		this.gl.bufferData(this.gl.ARRAY_BUFFER, model.getFloatTextureCoords(), this.gl.STATIC_DRAW);
//		this.textureCoordBuffer.itemSize = 2;
//		this.textureCoordBuffer.numItems = model.getFloatTextureCoords().length/2;

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.getFaces()), this.gl.STATIC_DRAW);
		this.vertexIndexBuffer.numItems = model.getFaces().length;
	},
	
	initialiseAttributes: function() {
		this.vertexPositionAttributeLocation = this.initialseArrayBuffer(this.vertexPositionBuffer, "position");
		this.vertexNormalAttributeLocation = this.initialseArrayBuffer(this.vertexNormalBuffer, "normal");
		//this.vertexTextureCoordAttributeLocation = this.initialseArrayBuffer(this.textureCoordBuffer, "texCoord");
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	},
	
	initialseArrayBuffer: function(buffer, attributeName) {
		var attributeLocation = this.gl.getAttribLocation(this.shaderProgram, attributeName);
		this.gl.enableVertexAttribArray(attributeLocation);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.vertexAttribPointer(attributeLocation, buffer.itemSize, this.gl.FLOAT, false, 0, 0);
		return attributeLocation;
	},
	
	drawObject: function(modelMatrix) {	
		var modelMatrixUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "modelMatrix");
		this.gl.uniformMatrix4fv(modelMatrixUniformLoc, this.gl.FALSE, modelMatrix);
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	},
};