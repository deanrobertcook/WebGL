function Model() {
	this.vertices;
	this.normals;
	this.faces;
	
	this.textureCoords;
	this.textureImage;
	
	this.texture;
	
	this.camera = false;
	this.lightSource = false;
	
	this.modelMatrix = mat4.create();
	
	this.reflectionAmbient = vec3.fromValues(1, 1, 1);
	this.reflectionDiffuse = vec3.fromValues(1, 1, 1);
	
	this.lightingUniforms;
}

Model.prototype = {
	setAsLightSource: function() {
		this.lightSource = new Light();
	},
	
	isLightSource: function() {
		return this.lightSource;
	},
	
	setAsCamera: function() {
		this.camera = true;
	},
	
	isCamera: function() {
		return this.camera;
	},
	
	setNewTexture: function(fileName) {
		this.texture = new Texture(fileName);
	},
	
	getTextureName: function() {
		return this.texture.fileName;
	},
	
	textureIsLoaded: function() {
		if (this.texture.image) {
			return true;
		} else {
			return false;
		}
	},
	
	hasWebGLTexture: function() {
			if (this.texture.webGLTexture) {
			return true;
		} else {
			return false;
		}
	},
	
	getFloatVertices: function() {
		return this.convertToFloat32(this.vertices);
	},

	getFloatVertexNormals: function() {
		return this.convertToFloat32(this.normals);
	},

	getFloatTextureCoords: function() {
		return new Float32Array(this.textureCoords);
	},

	getFaces: function() {
		return this.faces;
	},

	convertToFloat32: function(vecs) {
		return new Float32Array(vecs);
	},
	
	getModelMatrix: function() {
		return this.modelMatrix;
	},
	
	getViewMatrix: function() {
		return mat4.invert(mat4.create(), this.modelMatrix);
	},
	
	getPosition: function() {
		var position = vec4.fromValues(0, 0, 0, 1);
		vec4.transformMat4(position, position, this.modelMatrix);
		return position;
	},
	
	lookAtPosition: function(x, y, z) {
		mat4.invert(this.modelMatrix, mat4.lookAt(mat4.create(), this.getPosition(), [x, y, z], [0, 1, 0]));

	},
	
	scale: function(x, y, z) {
		mat4.scale(this.modelMatrix, this.modelMatrix, [x, y, z]);
	},

	translate: function(x, y, z) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
	},

	rotateX: function(angle) {
		mat4.rotateX(this.modelMatrix, this.modelMatrix, angle * (Math.PI)/180);
	},

	rotateY: function(angle) {
		mat4.rotateY(this.modelMatrix, this.modelMatrix, angle * (Math.PI)/180);
	},

	rotateZ: function(angle) {
		mat4.rotateZ(this.modelMatrix, this.modelMatrix, angle * (Math.PI)/180);
	},
};