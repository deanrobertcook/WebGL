function Light() {
	this.ambient = vec3.fromValues(0.2, 0.2, 0.2);
	this.diffuse = vec3.fromValues(0.8, 0.8, 0.8);
	this.specular;
};

Light.prototype = {	
	increaseAmbient: function(r, g, b) {
		vec3.add(this.ambient, this.ambient, [r, g, b]);
	},
	
	increaseDiffuse: function(r, g, b) {
		vec3.add(this.diffuse, this.diffuse, [r, g, b]);
	},
};