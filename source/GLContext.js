function GLContext(canvas) {
	this.glContext;
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
	this.initGL(canvas);
	
	
	this.shaderProgram;
	this.shaderFactory = new ShaderFactory();
	this.vertexShader = this.shaderFactory.getGLShader("vertexShader", this.glContext);
	this.fragmentShader = this.shaderFactory.getGLShader("fragmentShader", this.glContext);
	this.initShaders();
};

GLContext.prototype = {
	initGL: function(canvas) {
		try {
			this.glContext = canvas.getContext("experimental-webgl");
		} catch (e) {
			console.log("Couldn't initialise GL context" + e.message);
		}

		this.vertexPositionBuffer = this.glContext.createBuffer();
		this.vertexNormalBuffer = this.glContext.createBuffer();
		this.textureCoordBuffer = this.glContext.createBuffer();
		this.vertexIndexBuffer = this.glContext.createBuffer();
	},
	
	initShaders: function() {
		this.shaderProgram = this.glContext.createProgram();
		this.glContext.attachShader(this.shaderProgram, this.vertexShader);
		this.glContext.attachShader(this.shaderProgram, this.fragmentShader);
		this.glContext.linkProgram(this.shaderProgram);
		if (!this.glContext.getProgramParameter(this.shaderProgram, this.glContext.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}
		this.glContext.useProgram(this.shaderProgram);	
	},
	
	gl: function() {
		if (this.glContext) {
			return this.glContext;
		}
	}
};