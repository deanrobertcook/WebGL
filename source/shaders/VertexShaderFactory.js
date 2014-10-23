function VertexShaderFactory() {
	this.shader = [
		'attribute vec3 position;',
		'attribute vec3 normal;',
		'attribute vec2 texCoord;',
		
		'uniform vec4 lightPosition;',
		'uniform mat4 modelMatrix;',
		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		
		'varying vec3 n;',
		'varying vec3 l;',
		'varying vec2 vTexCoord;',
		
		'void main() {',
			'vTexCoord = texCoord;',
			'mat4 modelView = viewMatrix * modelMatrix;',
			
			'vec4 normalCamCoords = modelView * vec4(normal, 0.0);',
			'vec4 positionCamCoords = modelView * vec4(position, 1.0);',
			'vec4 lightPositionCamCoords = viewMatrix * lightPosition;',
			
			'n = normalize(normalCamCoords.xyz);',
			'l = normalize(lightPositionCamCoords.xyz - positionCamCoords.xyz);',
			
			'gl_PointSize = 2.0;',
			'gl_Position = projectionMatrix * positionCamCoords;',
		'}'
		].join("\n");
};