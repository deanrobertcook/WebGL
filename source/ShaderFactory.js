function ShaderFactory() {
	this.vertexShader = [
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
	
	this.fragmentShader = [
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

ShaderFactory.prototype = {
	getGLShader: function(shaderType, glContext) {
		var shaderScript = this[shaderType];
		var shader;

		if(shaderType === "vertexShader") {
			shader = glContext.createShader(glContext.VERTEX_SHADER);
		} else if (shaderType === "fragmentShader") {
			shader = glContext.createShader(glContext.FRAGMENT_SHADER);
		}

		glContext.shaderSource(shader, shaderScript);
		glContext.compileShader(shader, shaderScript);

		if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
			console.log(glContext.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	},
};