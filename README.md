WebGL
=====

A learning project designed to test out different elements of 3D WebGL

##Install

To run this application, open a terminal session, navigate to this folder, and run:
	
	python -m SimpleHTTPServer

and then navigate to
	
	http://localhost:8000

Alternatively, any server can provide the index.html file and everything should work fine.
Most browsers won't allow access to the images for the textures if the index.html is run "locally".

Tested and working with Firefox and Chrome.

To Do:
	Modify shaders to allow for multiple light objects
	Add specular lighting effects
	Add light attenuaton effects
	Allow for loading of random objects with random textures
	Allow for objects to be loaded while project is running
	Improve menu to allow user to change objects and textures
	Make the canvas resizeable
	Bring back mouse events to allow the Camera to rotate (so that we control the camera with WASD(QE) and the mouse)
	Make obects on the screen selectable (http://en.wikibooks.org/wiki/OpenGL_Programming/Object_selection)
