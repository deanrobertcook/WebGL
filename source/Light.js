function Light() {
	this.ambient = vec3.fromValues(0.1, 0.1, 0.1);
	this.diffuse = vec3.fromValues(1.0, 1.0, 1.0);
	this.specular = vec3.fromValues(0.8, 0.8, 0.8);
};

Light.prototype = {	
	increaseAmbient: function(r, g, b) {
		vec3.add(this.ambient, this.ambient, [r, g, b]);
	},
	
	increaseDiffuse: function(r, g, b) {
		vec3.add(this.diffuse, this.diffuse, [r, g, b]);
	},
};