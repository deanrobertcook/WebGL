var EventHandler = (function() {
	var private = {
		controller: null,
		keyBuffer: [],
		logKeyBufferToConsole: function() {
			for (var i = 0, l = private.keyBuffer.length; i < l; i++) {
				if(private.keyBuffer[i]) {
					console.log(i);
				}
			}
		}
	};
	
	function EventHandler (controller) {
		private.controller = controller;
		document.onkeydown = document.onkeyup = this.handleKeyPress.bind(this);
	};

	EventHandler.prototype = {
		handleKeyPress: function(event) {
			//console.log(event);
			event.preventDefault();
			event.stopPropagation();

			private.keyBuffer[event.keyCode] = event.type == "keydown";
			
			if(private.keyBuffer[67]) { //c
				private.controller.receiveUserCommand("nextCam");
			}


			if(private.keyBuffer[65]) { //a
				private.controller.receiveUserCommand("strafeLeft");
			} if (private.keyBuffer[83]) { //s
			} if (private.keyBuffer[68]) { //d
			} if (private.keyBuffer[81]) { //q
			} if (private.keyBuffer[87]) { //w
			} if (private.keyBuffer[69]) { //e
			} if (private.keyBuffer[38]) { //up
			} if (private.keyBuffer[40]) { //down
			} if (private.keyBuffer[37]) { //left
				if(private.keyBuffer[16]){ //shift
				} else {
				}
			} if (private.keyBuffer[39]) { //right
				if(private.keyBuffer[16]){ //shift
				} else {
				}
			} if (private.keyBuffer[79]) { //o
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