"use strict";

function main() {
  
  //Declare canvas and gl variables to set the draw objects.
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  //Create the vertex of the Objects
  var createFlattenedVertices = function(gl, vertices) {
    return webglUtils.createBufferInfoFromArrays(
        gl,
        primitives.makeRandomVertexColors(
            primitives.deindexVertices(vertices),
            {
              vertsPerColor: 0,
              rand: function(ndx, channel) {
                return channel < 3 ? ((128 + Math.random() * 1) | 0) : 255;
              }
            })
      );
  };

  //We use this primitive functions to create in an easy way, two "2d objects" 
  var sphereBufferInfo = createFlattenedVertices(gl, primitives.createSphereVertices(10, 22, 30));
  var coneBufferInfo   = createFlattenedVertices(gl, primitives.createTruncatedConeVertices(5, 0, 20, 12, 1, true, false));

  // setup GLSL program
  var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  //Radiance of the camera
  var cameraAngleRadians = degToRad(0);
  var fieldOfViewRadians = degToRad(60);
  var cameraHeight = 50;

  // Uniforms for each object.
  var sphereUniforms = {
    u_colorMult: [0.5, 1, 0.5, 1],
    u_matrix: m4.identity(),
  };
  
  var coneUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],
    u_matrix: m4.identity(),
  };
  
  //Positions of objects.
  var sphereTranslation = [  -20, 0, 0];

  var coneTranslation   = [ 10, 0, 0];

  //Draw the objects according to the uniforms and bufferInfo
  var objectsToDraw = [
    {
      programInfo: programInfo,
      bufferInfo: sphereBufferInfo,
      uniforms: sphereUniforms,
    },
   
    {
      programInfo: programInfo,
      bufferInfo: coneBufferInfo,
      uniforms: coneUniforms,
    },
  ];

  //Add arrays values.
  function computeMatrix(viewProjectionMatrix, translation,) {
    var matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, 0);
    return m4.yRotate(matrix, 0);
  }

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time *= 0.0005;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 1000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 50];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    

    // Compute the matrices for each object.
    sphereUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        sphereTranslation,);

    

    coneUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        coneTranslation,);

    //Draw the objects
    
    objectsToDraw.forEach(function(object) {
      var programInfo = object.programInfo;
      var bufferInfo = object.bufferInfo;

      gl.useProgram(programInfo.program);

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

      // Set the uniforms.
      webglUtils.setUniforms(programInfo, object.uniforms);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
    });

    requestAnimationFrame(drawScene);
  }
}

main();

