function View() {
	this.htmlAnchorID = "projectAnchor";
	this.canvas = null;
	this.canvasHeight = 500;//window.innerHeight;
	this.canvasWidth = 700; //window.innerWidth;
};

View.prototype = {
	constructGUI: function() {
		var appArea = $("<div id='CITS3200Project'></div>");
		appArea.append(this.produceCanvasHTML());
		appArea.append(this.produceMenuHTML());
		appArea = appArea.get(0);
		$("#" + this.htmlAnchorID).after(appArea);
	},
	
	produceCanvasHTML: function() {
		var canvas = $("<canvas id='projectCanvas'><canvas>");
		canvas.attr({width: this.canvasWidth, height: this.canvasHeight});
		canvas.css({
			border: "1px solid black",
			resize: "both",
			display: "block",
			float: "left",
		});
		canvas = canvas.get(0);
		this.canvas = canvas;
		return canvas;
	},
	
	produceMenuHTML: function() {
		var menu = $("<nav id='projectMenu'></nav>");
		menu.css({
			height: this.canvasHeight + "px",
			width: "150px",
			border: "1px solid black",
			"border-left": 0,
			display: "inline",
			float: "left",
		});
		
		
		var lightCamToggle = $("<button> Light/Cam Toggle</button>");
		
		var handleButtonClick = function() {
		if(this.modelInFocus === this.cameras[this.currentCamera]) {
				this.modelInFocus = this.lights[0];
			} else if(this.modelInFocus === this.lights[0]) {
				this.modelInFocus = this.cameras[this.currentCamera];
			}
		};
		
		lightCamToggle.click(handleButtonClick.bind(this)	);
		
		menu.append(lightCamToggle);
		menu = menu.get(0);
		return menu;
	},
	
	getCanvas: function() {
		if(this.canvas !== null) {
			return this.canvas;
		}
	},
};