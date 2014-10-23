function View(program) {
	this.htmlAnchorID = "projectAnchor";
	
	this.canvasHeight = 500;//window.innerHeight;
	this.canvasWidth = 700; //window.innerWidth;
	this.canvas = this.produceCanvasHTML();
	
	this.menu = this.produceMenuHTML();
	
	this.statusBar = this.produceStatusBarHTML();
};

View.prototype = {
	assembleGUI: function() {
		var appArea = $("<div id='CITS3200Project'></div>");
		appArea.append(this.statusBar);
		appArea.append(this.canvas);
		appArea.append(this.menu);
		appArea = appArea.get(0);
		$("#" + this.htmlAnchorID).after(appArea);
	},
	
	produceStatusBarHTML: function() {
		var statusBar = $("<div id='statusBar'>"+
				"<span id='refreshRateDisplay'></span>" +
				+"</div>");
		statusBar.css({
			border: "1px solid black",
			resize: "both",
		});
		statusBar = statusBar.get(0);
		return statusBar;
	},
	
	updateRefreshRateDisplay: function(refreshRate) {
		$("#refreshRateDisplay").html("Refresh Rate: " + refreshRate);
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
		
		menu = menu.get(0);
		return menu;
	},
	
	produceMenuButton: function(label, handler) {
		var button = $("<button>"+label+"</button>");
		button.click(handler);
		$(this.menu).append(button);
	},
	
	getCanvas: function() {
		if(this.canvas !== null) {
			return this.canvas;
		}
	},
};