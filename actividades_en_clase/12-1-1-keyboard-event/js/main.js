"use strict"

// global variables
var canvas;
var gl;
var positions;
var shaderProgram;
var aPosition, uModelViewProjMatrix;
var vboPosition;
var modelViewProjMatrix;
var xPos;
var yPos;

function initRenderingContext()
{
	canvas = document.getElementById("canvas");
	// Get a WebGL Context
	gl = canvas.getContext("webgl");
	if(gl)
	{
		// Set the clear Color
		gl.clearColor(0., 0., 0., 1.);	// black
	}
		return gl;
}

function initScene()
{
    xPos=0;
    yPos=0;
	positions = [ 0., 0.5, 	// V0
			     -0.5, -0.5,// v1
				  0.5, -0.5	// V2
				];
}

function initShaders()
{
	// Get Source for vertex & fragment shaders
	var vertexShaderSrc = document.getElementById("shader-vs").text;
	var fragmentShaderSrc = document.getElementById("shader-fs").text;

	// Create GLSL shaders (upload source & compile shaders)
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

	// Link the two shaders into a shader program
	shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

	// Look up into the vertex shader where the CPU's vertex data go
	aPosition = gl.getAttribLocation(shaderProgram, "aPosition");	
	uModelViewProjMatrix = gl.getUniformLocation(shaderProgram, "uModelViewProjMatrix");
}

function initBuffers()
{
	// Create a GPU's Vertex Buffer Object (VBO) and put clip-space vertex data 
	vboPosition = gl.createBuffer();

	// Bind the VBO to ARRAY_BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, vboPosition);

	// Upload CPU's vertex data into the GPU's VBO
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

function keyDownEventListener(event)
{
	if(event.keyCode == 37)	// Left Arrow Key
	
	{
	        xPos -= .1;
		document.getElementById("p-message").innerHTML = "Left Arrow Down";
	}
	else if(event.keyCode == 39)	// Right Arrow Key
	{
	        xPos += .1;
		document.getElementById("p-message").innerHTML = "Right Arrow Down";
	}
	renderScene();
}

function keyUpEventListener(event)
{
	if(event.keyCode == 38)	// Up Arrow Key
	{
        yPos += .1;
		document.getElementById("p-message").innerHTML = "Up Arrow Up";
	}
	else if(event.keyCode == 40)	// Down Arrow Key
	{
	    yPos -= .1;
		document.getElementById("p-message").innerHTML = "Down Arrow Up";
	}
	renderScene();
}

function keyPressEventListener(event)
{
	if(event.keyCode == 49)	// 1 character key
	{
		document.getElementById("p-message").innerHTML = "1 key";
	}
	else if(event.keyCode == 97)	// A character key
	{
		document.getElementById("p-message").innerHTML = "a key";
	}
	renderScene();
}

function initKeyEventHandlers()
{
	document.addEventListener("keydown", keyDownEventListener, false);
	document.addEventListener("keyup", keyUpEventListener, false);
	document.addEventListener("keypress", keyPressEventListener, false);
}

function renderScene()
{
	// Model Transformation
	var modelMatrix = mat4.create();	// Mmodel = I
    mat4.translate(modelMatrix,modelMatrix,[xPos,yPos,0])
	// View Transformation
	var viewMatrix = mat4.create();		// Mview = I
	var eye = [0., 0., 1.];
	var center = [0., 0., 0.];
	var up = [0., 1., 0.];
	mat4.lookAt(viewMatrix, eye, center, up);

	// Proj Transformation
	var projMatrix = mat4.create();		// Mproj = I
	var fovy = 60.;	// degrees
	fovy = fovy * Math.PI / 180.;
	var aspect = canvas.width / canvas.height;
	var near = 0.1;
	var far = 1000.;
	mat4.perspective(projMatrix, fovy, aspect, near, far);

	// Model-View-Projection Matrix
	// Mmodel-view-proj = Mproj * Mview * Mmodel
	modelViewProjMatrix = mat4.create();	// MmodelViewProj = I
	mat4.multiply(modelViewProjMatrix, viewMatrix, modelMatrix);
	mat4.multiply(modelViewProjMatrix, projMatrix, modelViewProjMatrix);

	// Clear the framebuffer (canvas)
	gl.clear(gl.COLOR_BUFFER_BIT);
				
	// Mapping from clip-space coords to the viewport in pixels
	gl.viewport(0, 0, canvas.width, canvas.height);
				
	// Tell WebGL which shader program to use (vertex & fragments shaders)
	gl.useProgram(shaderProgram);

	// Load uniform data into the GPU
	gl.uniformMatrix4fv(uModelViewProjMatrix, false, modelViewProjMatrix);
				
	// Turn on the attribute variable
	gl.enableVertexAttribArray(aPosition);
				
	// Bind to a VBO
	gl.bindBuffer(gl.ARRAY_BUFFER, vboPosition);
				
	// Tell the attribute (in) how to get data out of VBO
	var size = 2;			// 2 elements (x, y) per iteration
	var type = gl.FLOAT;	// 32 bit floats
	var normalize = false; 	// do not normalize the data
	var stride = 0;			// move forward size*sizeof(type) each iter to get next pos
	var offset = 0;			// start at the beginning of the VBO
	gl.vertexAttribPointer(aPosition, size, type, normalize, stride, offset);
				
	// Draw the scene
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 3;	
	gl.drawArrays(primitiveType, offset, count);
}

function main()
{
	// Initialization code
	gl = initRenderingContext();
	if(!gl)
	{
		return;
	}
	else
	{
		initScene();
		initShaders();
		initBuffers();
		initKeyEventHandlers();

		// Rendering code
		renderScene();
	}
}
