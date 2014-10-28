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
		'varying vec3 h;',
		'varying vec2 vTexCoord;',
		
		'void main() {',
			'vTexCoord = texCoord;',
			'mat4 modelView = viewMatrix * modelMatrix;',
			
			'vec4 normalCamCoords = modelView * vec4(normal, 0.0);',
			'vec4 positionCamCoords = modelView * vec4(position, 1.0);',
			'vec4 lightPositionCamCoords = viewMatrix * lightPosition;',
			
			'n = normalize(normalCamCoords.xyz);',
			'l = normalize(lightPositionCamCoords.xyz - positionCamCoords.xyz);',
			'vec3 e = normalize(-positionCamCoords.xyz);',
			'h = normalize(l + e);',
			
			'gl_PointSize = 2.0;',
			'gl_Position = projectionMatrix * positionCamCoords;',
		'}'
	].join("\n");
	
	this.fragmentShader = [
		'precision mediump float;',
		
		'uniform vec4 ambientProduct;',
		'uniform vec4 diffuseProduct;',
		'uniform vec4 specularProduct;',
		'uniform float shininess;',
		
		'uniform sampler2D texture;',
		'uniform float objectIndex;',

		
		'varying vec3 n;',
		'varying vec3 l;',
		'varying vec3 h;',
		'varying vec2 vTexCoord;',
		
		'void main() {',
			'if (objectIndex == -1.0) {',
				'vec4 ambient = ambientProduct;',
				'vec4 diffuse = max(dot(l, n), 0.0) * diffuseProduct;',
				'vec4 specular = pow(max(dot(h, n), 0.0), shininess) * specularProduct;',
				'vec4 color = ambient + diffuse;',
				'gl_FragColor = color * texture2D(texture, vTexCoord * 2.0) + specular;',
			'} else {',
				'gl_FragColor = vec4(1.0, 0, objectIndex / 256.0, 1.0);',
			'}',
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