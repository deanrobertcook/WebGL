function GLProgram(canvas) {
	this._ = {
		gl: null,
		vertexPositionBuffer: null,
		vertexNormalBuffer: null,
		textureCoordBuffer: null,
		vertexIndexBuffer: null,

		vertexPositionAttributeLocation: null,
		vertexNormalAttributeLocation: null,
		vertexTextureCoordAttributeLocation: null,

		shaderProgram: null,

		shaderFactory: null,
		vertexShader: null,
		fragmentShader: null,
	};

	this.initGL(canvas);

	this._.shaderFactory = new ShaderFactory();
	this._.vertexShader = this._.shaderFactory.getGLShader("vertexShader", this._.gl);
	this._.fragmentShader = this._.shaderFactory.getGLShader("fragmentShader", this._.gl);
	this.initShaders();

	this._.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this._.gl.enable(this._.gl.DEPTH_TEST);
};

GLProgram.prototype = {
	drawScene: function(scene) {	
		this.clearViewport();

		this.passViewMatrix(scene.viewMatrix);
		this.passProjectionMatrix(scene.projectionMatrix);

		var sceneModels = scene.sceneModels;
		for (var i = 0, l = sceneModels.length; i < l; i++) {
			var model = sceneModels[i];
			this.passLightUniforms(model.lightUniforms);

			if (model.hasWebGLTexture()) {
				this.passTexture(model.texture);
			} else {
				this.assignGLTexture(model.texture);
			}

			this.fillBuffers(model);
			this.initialiseAttributes();
			this.drawObject(model.getModelMatrix());
		}
	},

	initGL: function(canvas) {
		try {
			this._.gl = canvas.getContext("experimental-webgl");
		} catch (e) {
			console.log("Couldn't initialise GL context" + e.message);
		}

		this._.vertexPositionBuffer = this._.gl.createBuffer();
		this._.vertexNormalBuffer = this._.gl.createBuffer();
		this._.textureCoordBuffer = this._.gl.createBuffer();
		this._.vertexIndexBuffer = this._.gl.createBuffer();
	},

	initShaders: function() {
		this._.shaderProgram = this._.gl.createProgram();
		this._.gl.attachShader(this._.shaderProgram, this._.vertexShader);
		this._.gl.attachShader(this._.shaderProgram, this._.fragmentShader);
		this._.gl.linkProgram(this._.shaderProgram);
		if (!this._.gl.getProgramParameter(this._.shaderProgram, this._.gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}
		this._.gl.useProgram(this._.shaderProgram);	
	},

	passProjectionMatrix: function(projectionMatrix) {
		var projectionMatrixUniformLoc = this._.gl.getUniformLocation(this._.shaderProgram, "projectionMatrix");
		this._.gl.uniformMatrix4fv(projectionMatrixUniformLoc, this._.gl.FALSE, projectionMatrix);
	},

	passViewMatrix: function(viewMatrix) {
		var viewMatrixUniformLoc = this._.gl.getUniformLocation(this._.shaderProgram, "viewMatrix");
		this._.gl.uniformMatrix4fv(viewMatrixUniformLoc, this._.gl.FALSE, viewMatrix);
	},

	clearViewport: function() {
		this._.gl.viewport(0, 0, this._.gl.drawingBufferWidth, this._.gl.drawingBufferHeight);
		this._.gl.clear(this._.gl.COLOR_BUFFER_BIT | this._.gl.DEPTH_BUFFER_BIT);
	},

	passLightUniforms: function(lightUniforms) {
		$.each(lightUniforms, function(uniformName, uniformValue) {
			var UniformLoc = this._.gl.getUniformLocation(this._.shaderProgram, uniformName);
			this._.gl.uniform4fv(UniformLoc, uniformValue);
		}.bind(this));
	},

	fillBuffers: function(model) {
		this._.gl.bindBuffer(this._.gl.ARRAY_BUFFER, this._.vertexPositionBuffer);
		this._.gl.bufferData(this._.gl.ARRAY_BUFFER, model.getFloatVertices(), this._.gl.STATIC_DRAW);
		this._.vertexPositionBuffer.itemSize = 3;
		this._.vertexPositionBuffer.numItems = model.getFloatVertices().length/3;

		this._.gl.bindBuffer(this._.gl.ARRAY_BUFFER, this._.vertexNormalBuffer);
		this._.gl.bufferData(this._.gl.ARRAY_BUFFER, model.getFloatVertexNormals(), this._.gl.STATIC_DRAW);
		this._.vertexNormalBuffer.itemSize = 3;
		this._.vertexNormalBuffer.numItems = model.getFloatVertexNormals().length/3;

		this._.gl.bindBuffer(this._.gl.ARRAY_BUFFER, this._.textureCoordBuffer);
		this._.gl.bufferData(this._.gl.ARRAY_BUFFER, model.getFloatTextureCoords(), this._.gl.STATIC_DRAW);
		this._.textureCoordBuffer.itemSize = 2;
		this._.textureCoordBuffer.numItems = model.getFloatTextureCoords().length/2;

		this._.gl.bindBuffer(this._.gl.ELEMENT_ARRAY_BUFFER, this._.vertexIndexBuffer);
		this._.gl.bufferData(this._.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.getFaces()), this._.gl.STATIC_DRAW);
		this._.vertexIndexBuffer.numItems = model.getFaces().length;
	},

	initialiseAttributes: function() {
		this._.vertexPositionAttributeLocation = this.initialseArrayBuffer(this._.vertexPositionBuffer, "position");
		this._.vertexNormalAttributeLocation = this.initialseArrayBuffer(this._.vertexNormalBuffer, "normal");
		this._.vertexTextureCoordAttributeLocation = this.initialseArrayBuffer(this._.textureCoordBuffer, "texCoord");
		this._.gl.bindBuffer(this._.gl.ELEMENT_ARRAY_BUFFER, this._.vertexIndexBuffer);
	},

	initialseArrayBuffer: function(buffer, attributeName) {
		var attributeLocation = this._.gl.getAttribLocation(this._.shaderProgram, attributeName);
		this._.gl.enableVertexAttribArray(attributeLocation);
		this._.gl.bindBuffer(this._.gl.ARRAY_BUFFER, buffer);
		this._.gl.vertexAttribPointer(attributeLocation, buffer.itemSize, this._.gl.FLOAT, false, 0, 0);
		return attributeLocation;
	},

	drawObject: function(modelMatrix) {	
		var modelMatrixUniformLoc = this._.gl.getUniformLocation(this._.shaderProgram, "modelMatrix");
		this._.gl.uniformMatrix4fv(modelMatrixUniformLoc, this._.gl.FALSE, modelMatrix);
		this._.gl.drawElements(this._.gl.TRIANGLES, this._.vertexIndexBuffer.numItems, this._.gl.UNSIGNED_SHORT, 0);
	},

	assignGLTexture: function(texture) {
		var glTexture = this._.gl.createTexture();
		this._.gl.bindTexture(this._.gl.TEXTURE_2D, glTexture);
		this._.gl.pixelStorei(this._.gl.UNPACK_FLIP_Y_WEBGL, true);
		this._.gl.texImage2D(this._.gl.TEXTURE_2D, 0, this._.gl.RGBA, this._.gl.RGBA, this._.gl.UNSIGNED_BYTE, texture.image);
		this._.gl.texParameteri(this._.gl.TEXTURE_2D, this._.gl.TEXTURE_MAG_FILTER, this._.gl.NEAREST);
		this._.gl.texParameteri(this._.gl.TEXTURE_2D, this._.gl.TEXTURE_MIN_FILTER, this._.gl.NEAREST);
		this._.gl.bindTexture(this._.gl.TEXTURE_2D, null);
		texture.webGLTexture = glTexture;
	},

	passTexture: function(texture) {
		this._.gl.bindTexture(this._.gl.TEXTURE_2D, texture.webGLTexture);
		this._.gl.activeTexture(this._.gl.TEXTURE0);
		this._.gl.uniform1i(this._.shaderProgram.samplerUniform, 0);
	},
};