function FragmentShaderFactory() {
	this.shader = [
		'precision mediump float;',
		
		'uniform vec4 ambientProduct;',
		'uniform vec4 diffuseProduct;',
		'uniform sampler2D texture;',
		
		'varying vec3 n;',
		'varying vec3 l;',
		'varying vec2 vTexCoord;',
		
		'void main() {',
			'vec4 ambient = ambientProduct;',
			'vec4 diffuse = max(dot(l, n), 0.0) * diffuseProduct;',
			'vec4 color = ambient + diffuse;',
			'gl_FragColor = color * texture2D(texture, vTexCoord * 2.0);',
		'}'
	].join("\n");
};