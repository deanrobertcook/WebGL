function InputHandler (commandReceiver) {
	this._ = {
		commandReceiver: null,
		keyBuffer: [],
		logKeyBufferToConsole: function() {
			for (var i = 0, l = this._.keyBuffer.length; i < l; i++) {
				if(this._.keyBuffer[i]) {
					console.log(i);
				}
			}
		}
	};
	this._.commandReceiver = commandReceiver;
	document.onkeydown = document.onkeyup = this.handleKeyPress.bind(this);
};

InputHandler.prototype = {
	handleKeyPress: function(event) {
		//console.log(event);
		event.preventDefault();
		event.stopPropagation();

		this._.keyBuffer[event.keyCode] = event.type == "keydown";

		if(this._.keyBuffer[67]) { //c
			this._.commandReceiver.keyC();
		} if(this._.keyBuffer[65]) { //a
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
		this.mouseDown = event.button;
		this.lastMouseXPos = event.clientX;
		this.lastMouseYPos = event.clientY;
	},

	handleMouseUp: function(event) {
		this.mouseDown = -1;
	},

	handleMouseMove: function(event) {
		var	winXPos = event.clientX,
				winYPos = event.clientY,
				xPosDelta = winXPos - this.lastMouseXPos,
				yPosDelta = winYPos - this.lastMouseYPos;

		if (this.mouseDown === 1) {
			this.camera1.rotateX(yPosDelta/2);
		} else if (this.mouseDown === 0) {
			this.camera1.translate(0, 0, -yPosDelta/10);
			this.camera1.rotateY(xPosDelta/2);
		}

		this.passViewMatrix(this.camera1.getViewMatrix());
		this.lastMouseXPos = winXPos;
		this.lastMouseYPos = winYPos;
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


};