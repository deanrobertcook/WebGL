var EventHandler = (function() {
	var private = {
		commandReceiver: null,
		keyBuffer: [],
		logKeyBufferToConsole: function() {
			for (var i = 0, l = private.keyBuffer.length; i < l; i++) {
				if(private.keyBuffer[i]) {
					console.log(i);
				}
			}
		}
	};
	
	function EventHandler (commandReceiver) {
		private.commandReceiver = commandReceiver;
		document.onkeydown = document.onkeyup = this.handleKeyPress.bind(this);
	};

	EventHandler.prototype = {
		handleKeyPress: function(event) {
			//console.log(event);
			event.preventDefault();
			event.stopPropagation();

			private.keyBuffer[event.keyCode] = event.type == "keydown";
			
			if(private.keyBuffer[67]) { //c
				private.commandReceiver.keyC();
			} if(private.keyBuffer[65]) { //a
				private.commandReceiver.keyA();
			} if (private.keyBuffer[83]) { //s
				private.commandReceiver.keyS();
			} if (private.keyBuffer[68]) { //d
				private.commandReceiver.keyD();
			} if (private.keyBuffer[81]) { //q
				private.commandReceiver.keyQ();
			} if (private.keyBuffer[87]) { //w
				private.commandReceiver.keyW();
			} if (private.keyBuffer[69]) { //e
				private.commandReceiver.keyE();
			} if (private.keyBuffer[38]) { //up
				private.commandReceiver.keyUp();
			} if (private.keyBuffer[40]) { //down
				private.commandReceiver.keyDown();
			} if (private.keyBuffer[37]) { //left
				if(private.keyBuffer[16]){ //shift
					private.commandReceiver.keysShiftAndLeft();
				} else {
					private.commandReceiver.keyLeft();
				}
			} if (private.keyBuffer[39]) { //right
				if(private.keyBuffer[16]){ //shift
					private.commandReceiver.keysShiftAndRight();
				} else {
					private.commandReceiver.keyRight();
				}
			} if (private.keyBuffer[79]) { //o
				private.commandReceiver.keyO();
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
	
	return EventHandler;
})();