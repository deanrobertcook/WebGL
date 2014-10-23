function ModelFactory() {
	this.modelsLocation = "meshes/";
};

ModelFactory.prototype = {
	loadModel: function(modelFileName, caller, callback) {
		$.ajax({
			context: this,
			url: this.modelsLocation + modelFileName + ".json",
			datatype: "json",
			success: function(data){
				var model = new Model();
				model.vertices = data.meshes[0].vertices;
				model.normals = data.meshes[0].normals;
				model.faces = this.concatenateFaceArrays(data.meshes[0].faces);
				model.textureCoords = data.meshes[0].texturecoords[0];
				model.modelMatrix = data.rootnode.transformation;
				if (data.rootnode.camera) {
					model.setAsCamera()
					caller.cameras.push(model);
				}
				
				if (data.rootnode.light) {
					model.setAsLightSource();
					caller.lights.push(model);
				}
				caller.loadModels();
				callback(model);
				return model;
			}
		});
	},
	
	concatenateFaceArrays: function(faceArrays) {
		var joinedList = [];
		for (var i = 0; i < faceArrays.length; i++) {
			for (var j = 0; j < faceArrays[i].length; j++) {
				joinedList.push(faceArrays[i][j]);
			}
		}
		return joinedList;
	},

	getModels: function() {
		return this.models;
	}
};

