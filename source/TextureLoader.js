function TextureLoader() {
	this.texturesLocation = "textures/";
	this.texturesToLoad = [
			"texture25",
		];
	this.glTextures = [];
};

TextureLoader.prototype = {
	loadTextureAsWebGLTexture: function(textureFileName, callingProgram) {
		var glContext = callingProgram.gl.gl();
		var textureImage = new Image();
		var handleTexture = function() {
			var glTexture = glContext.createTexture();
			glContext.bindTexture(glContext.TEXTURE_2D, glTexture);
			glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, true);
			glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, textureImage);
			glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.NEAREST);
			glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.NEAREST);
			glContext.bindTexture(glContext.TEXTURE_2D, null);
			this.glTextures.push(glTexture);
			callingProgram.loadTextures();
		};
		textureImage.onload = handleTexture.bind(this);
		textureImage.src = this.texturesLocation + textureFileName + ".bmp";
	},

	getGLTexture: function(index) {
		return this.glTextures[index];
	}
};

