function InputHandler (commandReceiver, canvas) {
	this._ = {
		commandReceiver: null,
		keyBuffer: [],
		mouseData: {
			button: null,
			x: 0,
			y: 0,
		},
	};
	this._.commandReceiver = commandReceiver;
	document.onkeydown = document.onkeyup = this.handleKeyPress.bind(this);
	$(canvas).on("contextmenu", this.disableRightClick.bind(this));
	$(canvas).on("mousedown", this.handleMouseDown.bind(this));
	$(canvas).on("mouseup", this.handleMouseUp.bind(this));
	$(canvas).on("mousemove", this.handleMouseMove.bind(this));
};

InputHandler.prototype = {
	handleKeyPress: function(event) {
		//console.log(event);
		event.preventDefault();
		event.stopPropagation();

		this._.keyBuffer[event.keyCode] = event.type == "keydown";

		//Think of using a "key state object" that the controller checks,
		//rather than calling a bajillion functions
		
		if(this._.keyBuffer[65]) { //a
			this._.commandReceiver.keyA();
		} if (this._.keyBuffer[83]) { //s
			this._.commandReceiver.keyS();
		} if (this._.keyBuffer[68]) { //d
			this._.commandReceiver.keyD();
		} if (this._.keyBuffer[81]) { //q
			this._.commandReceiver.keyQ();
		} if (this._.keyBuffer[87]) { //w
			this._.commandReceiver.keyW();
		} if (this._.keyBuffer[69]) { //e
			this._.commandReceiver.keyE();
		} if (this._.keyBuffer[38]) { //up
			this._.commandReceiver.keyUp();
		} if (this._.keyBuffer[40]) { //down
			this._.commandReceiver.keyDown();
		} if (this._.keyBuffer[37]) { //left
			if(this._.keyBuffer[16]){ //shift
				this._.commandReceiver.keysShiftAndLeft();
			} else {
				this._.commandReceiver.keyLeft();
			}
		} if (this._.keyBuffer[39]) { //right
			if(this._.keyBuffer[16]){ //shift
				this._.commandReceiver.keysShiftAndRight();
			} else {
				this._.commandReceiver.keyRight();
			}
		} if (this._.keyBuffer[79]) { //o
			this._.commandReceiver.keyO();
		}
	},


	handleMouseDown:  function(event) {
		event.stopPropagation();
		event.preventDefault();
		this._.mouseData.button = event.button;
		if (event.button === 0) {
			this._.commandReceiver.leftMouseClick(this._.mouseData);
		} else if (event.button === 1) {
			this._.commandReceiver.middleMouseClick(this._.mouseData);
		} else if (event.button === 2) {
			this._.commandReceiver.rightMouseClick(this._.mouseData);
		}
		
	},
	
	disableRightClick: function() {
		return false;
	},

	handleMouseUp: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this._.mouseData.button = -1;
		this._.commandReceiver.mouseUp(this._.mouseData);
	},

	handleMouseMove: function(event) {
		var	winXPos = event.clientX,
			winYPos = event.clientY;
			
		var bottomLeftCoords = this.calculateBottomLeftCoords(winXPos, winYPos, event.toElement);

		this._.mouseData.x = bottomLeftCoords.x;
		this._.mouseData.y = bottomLeftCoords.y;
	},
	
	calculateBottomLeftCoords: function(mouseXPosWindow, mouseYPosWindow, element) {
		var elementXPos = $(element).position().left;
		var elementYPos = $(element).position().top;
		
		var bottomLeftXPos = mouseXPosWindow - elementXPos;
		var topLeftYPos = mouseYPosWindow - elementYPos;
		var bottomLeftYPos = element.height - topLeftYPos;
		
		return {x: bottomLeftXPos, y: bottomLeftYPos};
	},

	handleMouseWheel: function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (event.wheelDeltaY > 0) {
			this.camera1.translate(0, 0, 0.5);
		} else if (event.wheelDeltaY < 0) {
			this.camera1.translate(0, 0, -0.5);
		}
		this.passViewMatrix(this.camera1.getViewMatrix());
	},

	logKeyBufferToConsole: function() {
		for (var i = 0, l = this._.keyBuffer.length; i < l; i++) {
			if(this._.keyBuffer[i]) {
				console.log(i);
			}
		}
	},
};