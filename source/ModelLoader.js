function ModelLoader() {
	this.modelsLocation = "meshes/";
	this.models = [];
};

ModelLoader.prototype = {
	loadModel: function(modelFileName, caller) {
		$.ajax({
			context: this,
			url: this.modelsLocation + modelFileName + ".json",
			datatype: "json",
			success: function(data){
				console.log(data);
				
				var model = new Model();
				model.vertices = data.meshes[0].vertices;
				model.normals = data.meshes[0].normals;
				model.faces = this.concatenateFaceArrays(data.meshes[0].faces);
				model.textureCoords = data.meshes[0].texturecoords[0];

				console.log(model);
				this.models.push(model);
				caller.loadModels();
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

