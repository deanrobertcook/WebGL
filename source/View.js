function View() {
	this._ = {
		htmlAnchorID: "projectAnchor",
		canvasHeight: 500,
		canvasWidth: 700,

		canvas: null,
		menu: null,
		statusBar: null,
	};

	this._.canvas = this.produceCanvasHTML();
	this._.menu = this.produceMenuHTML();
	this._.statusBar = this.produceStatusBarHTML();
	this._.rightClickMenu = this.produceRightClickMenuHTML();
};

View.prototype = {
	assembleGUI: function() {
		var appArea = $("<div id='CITS3200Project'></div>");
		appArea.append(this._.statusBar);
		appArea.append(this._.canvas);
		appArea.append(this._.menu);
		appArea.append(this._.rightClickMenu);
		appArea = appArea.get(0);
		$("#" + this._.htmlAnchorID).after(appArea);
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
		var canvas = $("<canvas id='projectCanvas'></canvas>");
		canvas.attr({width: this._.canvasWidth, height: this._.canvasHeight});
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
			height: this._.canvasHeight + "px",
			width: "150px",
			border: "1px solid black",
			"border-left": 0,
			display: "inline",
			float: "left",
		});

		menu = menu.get(0);
		return menu;
	},
	
	produceRightClickMenuHTML: function() {
		var menu = $("<nav id='rightClickMenu'></nav>");
		menu.css({
			width: "150px",
			border: "1px solid black",
			"border-left": 0,
			"background-color": "grey",
			display: "none",
			position: "absolute",
		});
		menu.on("contextmenu", function() {return false;});
		menu = menu.get(0);
		return menu;
	},

	produceMenuButton: function(menu, label, handler) {
		var button = $("<button>"+label+"</button>");
		button.click(handler);
		$(this._[menu]).append(button);
	},
	
	displayRightClickMenu: function(mousePosition) {
		$(this._.rightClickMenu).css({
			top: (this._.canvas.height - mousePosition.y + $(this._.canvas).position().top) + "px",
			left: (mousePosition.x + $(this._.canvas).position().left) + "px",
			display: "block",
		});
	},
	
	hideRightClickMenu: function() {
		$(this._.rightClickMenu).css({
			display: "none",
		});
	},
	
	getCanvas: function() {
		if(this._.canvas !== null) {
			return this._.canvas;
		}
	},
};