function EventHandler (callingProgram) {
	document.onkeydown = document.onkeyup = this.handleKeyPress.bind(callingProgram);
};

EventHandler.prototype = {
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

	handleKeyPress: function(event, model) {
		//console.log(event);
		event.preventDefault();
		event.stopPropagation();

		this.keyBuffer[event.keyCode] = event.type == "keydown";

		//keyLogger
		for (var i = 0, l = this.keyBuffer.length; i < l; i++) {
			if(this.keyBuffer[i]) {
				//console.log(i);
			}
		}


		if(this.keyBuffer[67]) { //c
			var numCameras = this.cameras.length;
			this.currentCamera += 1;
			this.currentCamera %= numCameras;
			
			this.modelInFocus = this.cameras[this.currentCamera];
		}


		if(this.keyBuffer[65]) { //a
			this.modelInFocus.translate(-1, 0, 0);
		} if (this.keyBuffer[83]) { //s
			this.modelInFocus.translate(0, 0, 1);
		} if (this.keyBuffer[68]) { //d
			this.modelInFocus.translate(1, 0, 0);
		} if (this.keyBuffer[81]) { //q
			this.modelInFocus.translate(0, 1, 0);
		} if (this.keyBuffer[87]) { //w
			this.modelInFocus.translate(0, 0, -1);
		} if (this.keyBuffer[69]) { //e
			this.modelInFocus.translate(0, -1, 0);
		} if (this.keyBuffer[38]) { //up
			this.modelInFocus.rotateX(10);
		} if (this.keyBuffer[40]) { //down
			this.modelInFocus.rotateX(-10);
		} if (this.keyBuffer[37]) { //left
			if(this.keyBuffer[16]){ //shift
				this.modelInFocus.rotateZ(10);
			} else {
				this.modelInFocus.rotateY(10);
			}
		} if (this.keyBuffer[39]) { //right
			if(this.keyBuffer[16]){ //shift
				this.modelInFocus.rotateZ(-10);
			} else {
				this.modelInFocus.rotateY(-10);
			}
		} if (this.keyBuffer[79]) { //o
			this.modelInFocus.lookAtOrigin(0, 0, 0);
		}
	},
};