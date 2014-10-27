var EventHandler = (function() {
	var private = {
		controller: null,
		keyBuffer: [],
	};
	
	function EventHandler (controller) {
		private.controller = controller;
		document.onkeydown = document.onkeyup = this.handleKeyPress.bind(this);
	};

	EventHandler.prototype = {
		handleKeyPress: function(event, model) {
			//console.log(event);
			event.preventDefault();
			event.stopPropagation();

			private.keyBuffer[event.keyCode] = event.type == "keydown";

			//keyLogger
			for (var i = 0, l = private.keyBuffer.length; i < l; i++) {
				if(private.keyBuffer[i]) {
					//console.log(i);
				}
			}

			this.modelInFocus = private.sceneBuilder.cameras[0];

			if(private.keyBuffer[67]) { //c
				var numCameras = this.cameras.length;
				this.currentCamera += 1;
				this.currentCamera %= numCameras;

				this.modelInFocus = this.cameras[this.currentCamera];
			}


			if(private.keyBuffer[65]) { //a
				this.modelInFocus.translate(-1, 0, 0);
				console.log("strafeLeft");
			} if (private.keyBuffer[83]) { //s
				this.modelInFocus.translate(0, 0, 1);
			} if (private.keyBuffer[68]) { //d
				this.modelInFocus.translate(1, 0, 0);
			} if (private.keyBuffer[81]) { //q
				this.modelInFocus.translate(0, 1, 0);
			} if (private.keyBuffer[87]) { //w
				this.modelInFocus.translate(0, 0, -1);
			} if (private.keyBuffer[69]) { //e
				this.modelInFocus.translate(0, -1, 0);
			} if (private.keyBuffer[38]) { //up
				this.modelInFocus.rotateX(10);
			} if (private.keyBuffer[40]) { //down
				this.modelInFocus.rotateX(-10);
			} if (private.keyBuffer[37]) { //left
				if(private.keyBuffer[16]){ //shift
					this.modelInFocus.rotateZ(10);
				} else {
					this.modelInFocus.rotateY(10);
				}
			} if (private.keyBuffer[39]) { //right
				if(private.keyBuffer[16]){ //shift
					this.modelInFocus.rotateZ(-10);
				} else {
					this.modelInFocus.rotateY(-10);
				}
			} if (private.keyBuffer[79]) { //o
				this.modelInFocus.lookAtOrigin(0, 0, 0);
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