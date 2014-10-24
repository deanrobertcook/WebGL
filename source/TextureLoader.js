function TextureLoader() {
	this.texturesLocation = "textures/";
	this.texturesLoaded = [];
};

TextureLoader.prototype = {
	loadTextureFor: function(model) {
		var texture = this.findTexture(model.texture.fileName);
		if (texture) {
			model.texture = texture;
		} else {
			var textureImage = new Image();
			var handleTexture = function() {
				texture = new Texture();
				texture.fileName = model.texture.fileName;
				texture.image = textureImage;
				this.texturesLoaded.push(texture);
				model.texture = texture;
			}
			textureImage.onload = handleTexture.bind(this);
			textureImage.src = this.texturesLocation + model.texture.fileName + ".bmp";
		}
	},
	
	findTexture: function(textureFileName) {
		var texturesLoaded = this.texturesLoaded;
		for (var i = 0, l = texturesLoaded.length; i < l; i++) {
			if (textureFileName === texturesLoaded[i].fileName) {
				return texturesLoaded[i];
			}
		}
		return false;
	},
};

function Texture(fileName) {
	this.fileName = fileName;
	this.image;
	this.webGLTexture;
};

Texture.prototype = {

};