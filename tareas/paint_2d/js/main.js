"use strict"

class Triangle extends GlComponent {

	constructor ({ gl, shaders, points, pointSize, color, colors }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: points
				}),
				vboColor: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: colors
				})
			},
			data: {}
		})
		this.currentShader = "singleColorShader"
		this.color = color.slice()
		this.colors = colors
		this.points = points
		this.pointSize = pointSize
		this.modelMatrix = mat4.create()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor (color) {
		this.color = color.slice()
	}

	setColors (colors) {
		this.colors = colors
		this.buffers["vboColor"].loadBufferData(colors)
	}

	getCentroid () {
		var x = (this.points[0] + this.points[2] + this.points[4]) / 3.
		var y = (this.points[1] + this.points[3] + this.points[5]) / 3.
		return [x, y]
	}

	translate (tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz]);
	}

	rotate (angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	scale (sx, sy) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.scale(this.modelMatrix, this.modelMatrix, [sx, sy, 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	setDrawingMode(drawingMode="single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader (shaderName="pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate () {

	}

	draw () {
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition", 2, this.gl.FLOAT, false, 0, 0)
		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)
	}
}

class Square extends GlComponent {

	constructor({ gl, shaders, start, width, height, pointSize, color, colors }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition1: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						start[0], start[1],
						start[0] + width, start[1],
						start[0] + width, start[1] - height
					]
				}),
				vboPosition2: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						start[0] + width, start[1] - height,
						start[0], start[1] - height,
						start[0], start[1]
					]
				}),
				vboColor1: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
						colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
						colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3]
					]
				}),
				vboColor2: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3],
						colors[12], colors[12 + 1], colors[12 + 2], colors[12 + 3],
						colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3]
					]
				})
			},
			data: {}
		})
		this.width = width
		this.height = height
		this.start = start
		this.currentShader = "singleColorShader"
		this.color = color.slice()
		this.colors = colors
		this.pointSize = pointSize
		this.modelMatrix = mat4.create()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor(color) {
		this.color = color.slice()
	}

	setColors(colors) {
		this.colors = colors
		this.buffers["vboColor1"].loadBufferData([
			colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
			colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
			colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3]
		])
		this.buffers["vboColor2"].loadBufferData([
			colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3],
			colors[12], colors[12 + 1], colors[12 + 2], colors[12 + 3],
			colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3]
		])
	}

	getCentroid() {
		var x = this.start[0] + this.width / 2.
		var y = this.start[1] - this.height / 2.
		return [x, y]
	}

	translate(tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz]);
	}

	rotate(angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	scale(sx, sy) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.scale(this.modelMatrix, this.modelMatrix, [sx, sy, 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	setDrawingMode(drawingMode = "single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader(shaderName = "pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate() {

	}

	draw() {
		// First
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition1", 2, this.gl.FLOAT, false, 0, 0)

		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor1", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)

		// Second
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition2", 2, this.gl.FLOAT, false, 0, 0)

		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor2", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)
	}
}

class Trapezoid extends GlComponent {

	constructor({ gl, shaders, pointSize, color, colors }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition1: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						-0.5, 0.5, 	// upper left
						0., -0.5,	// lower middle
						-1, -0.5   // lower left
					]
				}),
				vboPosition2: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						-0.5, 0.5,	// upper left
						0.5, 0.5, // upper right
						0., -0.5 	// lower middle
					]
				}),
				vboPosition3: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						0.5, 0.5, // upper right
						1, -0.5, // lower right
						0., -0.5 // lower middle
					]
				}),
				vboColor1: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
						(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2,
						colors[12], colors[12 + 1], colors[12 + 2], colors[12 + 3],
					]
				}),
				vboColor2: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
						colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
						(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2
					]
				}),
				vboColor3: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: [
						colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
						colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3],
						(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2
					]
				}),
			},
			data: {}
		})
		this.currentShader = "singleColorShader"
		//this.points = points
		this.color = color.slice()
		this.colors = colors
		this.pointSize = pointSize
		this.modelMatrix = mat4.create()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor(color) {
		this.color = color.slice()
	}

	setColors(colors) {
		this.colors = colors
		this.buffers["vboColor1"].loadBufferData([
			colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
			(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2,
			colors[12], colors[12 + 1], colors[12 + 2], colors[12 + 3]
		])
		this.buffers["vboColor2"].loadBufferData([
			colors[0], colors[0 + 1], colors[0 + 2], colors[0 + 3],
			colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
			(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2
		])
		this.buffers["vboColor3"].loadBufferData([
			colors[4], colors[4 + 1], colors[4 + 2], colors[4 + 3],
			colors[8], colors[8 + 1], colors[8 + 2], colors[8 + 3],
			(colors[8] + colors[12]) / 2, (colors[8 + 1] + colors[12 + 1]) / 2, (colors[8 + 2] + colors[12 + 2]) / 2, (colors[8 + 3] + colors[12 + 3]) / 2
		])
	}

	getCentroid() {
		var x = (-0.5 + 0.5 + 0.) / 3.
		var y = (0.5 + 0.5 - 0.5) / 3.
		return [x, y]
	}

	translate(tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz]);
	}

	rotate(angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}
    
	scale(sx, sy) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.scale(this.modelMatrix, this.modelMatrix, [sx, sy, 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	setDrawingMode(drawingMode = "single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader(shaderName = "pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate() {

	}

	draw() {
		for (var i = 1; i <= 3; i++) {
			// First
			this.useProgram(this.currentShader)
			this.setupAttribute("aPosition", `vboPosition${i}`, 2, this.gl.FLOAT, false, 0, 0)

			this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

			if (this.currentShader == "pointShader")
				this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
			else if (this.currentShader == "singleColorShader") {
				this.gl.uniform4fv(this.getUniform("uColor"), this.color)
			} else if (this.currentShader == "perVertexColorShader") {
				this.setupAttribute("aColor", `vboColor${i}`, 4, this.gl.FLOAT, false, 0, 0)
			}

			var primitive = this.gl.TRIANGLES;

			if (this.mode == "wireframe") {
				primitive = this.gl.LINE_LOOP
			} else if (this.mode == "line") {
				primitive = this.gl.LINES
			} else if (this.mode == "points") {
				primitive = this.gl.POINTS
			}
			this.drawArrays(primitive, 0, 3)
		}
		return;
		// First
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition1", 2, this.gl.FLOAT, false, 0, 0)

		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor1", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)

		// Second
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition2", 2, this.gl.FLOAT, false, 0, 0)

		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor2", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)

		// Third
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition3", 2, this.gl.FLOAT, false, 0, 0)

		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor3", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLES;

		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, 3)
	}
}

class Circle extends GlComponent {

	constructor({ gl, shaders, radius, pointSize, color, colors }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition: new GlBuffer({
					gl: gl,
					type: Float32Array
				}),
				vboColor: new GlBuffer({
					gl: gl,
					type: Float32Array
				})
			},
			data: {}
		})
		this.currentShader = "singleColorShader"
		this.mode = "single-color"
		this.color = color.slice()
		this.colors = colors
		this.radius = radius
		this.pointSize = pointSize
		this.centerColors = colors.slice(0, 4);
		this.outerColors = colors.slice(4, 8);
		this.modelMatrix = mat4.create()
		this.n = this.generatePoints()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor (color) {
		this.color = color.slice()
	}

	setColors (colors) {
		this.colors = colors
		this.n = this.generatePoints()
	}

	generatePoints () {
		// Create a buffer object
		var vertices = []
		var colors = []
		for (var deg = 0.0; deg <= 360; deg += 1) {
			var rad = deg * Math.PI / 180
			vertices = vertices.concat([ this.radius * Math.sin(rad), this.radius * Math.cos(rad), 0, 0 ])
			colors = colors.concat(this.colors)
		}
		var n = vertices.length / 2;
		this.buffers["vboPosition"].loadBufferData(vertices)
		this.buffers["vboColor"].loadBufferData(colors);

		return n;
	}

	getCentroid() {
		var x = 0
		var y = 0
		return [x, y]
	}

	translate(tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz]);
	}

	rotate(angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	scale(sx, sy) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.scale(this.modelMatrix, this.modelMatrix, [sx, sy, 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	setDrawingMode(drawingMode = "single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader(shaderName = "pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate() {

	}

	draw() {
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition", 2, this.gl.FLOAT, false, 0, 0)
		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.TRIANGLE_STRIP;
		if (this.mode == "wireframe") {
			primitive = this.gl.LINE_LOOP
		} else if (this.mode == "line") {
			primitive = this.gl.LINES
		} else if (this.mode == "points") {
			primitive = this.gl.POINTS
		}
		this.drawArrays(primitive, 0, this.n)
	}
}

class Point extends GlComponent {

	constructor({ gl, shaders, point, pointSize, color }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: point
				})
			},
			data: {}
		})
		this.currentShader = "pointShader"
		this.color = color
		this.point = point
		this.pointSize = pointSize
		this.modelMatrix = mat4.create()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor(color) {
		this.color = color.slice()
	}

	getCentroid() {
		return this.point
	}

	translate(tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz])
	}

	rotate(angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	scale(s) {
		this.pointSize *= s;
	}

	setDrawingMode(drawingMode = "single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader(shaderName = "pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate() {

	}

	draw() {
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition", 2, this.gl.FLOAT, false, 0, 0)
		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		}

		var primitive = this.gl.POINTS;

		this.drawArrays(primitive, 0, 1)
	}
}

class Segment extends GlComponent {

	constructor({ gl, shaders, points, pointSize, color, colors }) {
		super({
			gl: gl,
			shaders: shaders,
			buffers: {
				vboPosition: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: points
				}),
				vboColor: new GlBuffer({
					gl: gl,
					type: Float32Array,
					initialData: colors
				})
			},
			data: {}
		})
		this.currentShader = "singleColorShader"
		this.color = color
		this.colors = colors
		this.points = points
		this.pointSize = pointSize
		this.modelMatrix = mat4.create()
		this.setRender(this.draw)
		this.setUpdate(this.animate)
	}

	setColor(color) {
		this.color = color.slice()
	}

	setColors(colors) {
		this.colors = colors
		this.buffers["vboColor"].loadBufferData(colors)
	}

	getCentroid() {
		var x = (this.points[0] + this.points[2]) / 2
		var y = (this.points[1] + this.points[3]) / 2
		return [x, y]
	}

	translate(tx, ty, tz) {
		mat4.translate(this.modelMatrix, this.modelMatrix, [tx, ty, tz]);
	}

	rotate(angle) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.rotate(this.modelMatrix, this.modelMatrix, angle * Math.PI / 180., [0., 0., 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	scale(sx, sy) {
		var centroid = this.getCentroid()
		mat4.translate(this.modelMatrix, this.modelMatrix, [centroid[0], centroid[1], 0.])
		mat4.scale(this.modelMatrix, this.modelMatrix, [sx, sy, 1.])
		mat4.translate(this.modelMatrix, this.modelMatrix, [0 - centroid[0], 0 - centroid[1], 0.])
	}

	setDrawingMode(drawingMode = "single-color") {
		this.mode = drawingMode;
		if (drawingMode == "single-color" || drawingMode == "wireframe" || drawingMode == "line") {
			this.setShader("singleColorShader");
		}
		else if (drawingMode == "per-vertex-color") {
			this.setShader("perVertexColorShader");
		}
		else if (drawingMode == "points") {
			this.setShader("pointShader");
		}
	}

	setShader(shaderName = "pointShader") {
		this.useProgram(shaderName)
		this.currentShader = shaderName
	}

	animate() {

	}

	draw() {
		this.useProgram(this.currentShader)
		this.setupAttribute("aPosition", "vboPosition", 2, this.gl.FLOAT, false, 0, 0)
		this.gl.uniformMatrix4fv(this.getUniform("uModelViewProjMatrix"), false, this.modelMatrix)

		if (this.currentShader == "pointShader")
			this.gl.uniform1f(this.getUniform("uPointSize"), this.pointSize)
		else if (this.currentShader == "singleColorShader") {
			this.gl.uniform4fv(this.getUniform("uColor"), this.color)
		} else if (this.currentShader == "perVertexColorShader") {
			this.setupAttribute("aColor", "vboColor", 4, this.gl.FLOAT, false, 0, 0)
		}

		var primitive = this.gl.LINES;

		if (this.mode == "points") {
			primitive = this.gl.POINTS
		}

		this.drawArrays(primitive, 0, 2)
	}
}

var pointShader, singleColorShader, perVertexColorShader

function createComponents(gl) {

	pointShader = new GlShader({
		gl: gl,
		vertexShader: document.getElementById("point-shader-vs").text,
		fragmentShader: document.getElementById("point-shader-fs").text,
		attributes: ["aPosition"],
		uniforms: ["uPointSize", "uColor", "uModelViewProjMatrix"]
	})

	singleColorShader = new GlShader({
		gl: gl,
		vertexShader: document.getElementById("single-color-shader-vs").text,
		fragmentShader: document.getElementById("single-color-shader-fs").text,
		attributes: ["aPosition"],
		uniforms: ["uColor", "uModelViewProjMatrix"]
	})

	perVertexColorShader = new GlShader({
		gl: gl,
		vertexShader: document.getElementById("per-vertex-color-shader-vs").text,
		fragmentShader: document.getElementById("per-vertex-color-shader-fs").text,
		attributes: ["aPosition", "aColor"],
		uniforms: ["uModelViewProjMatrix"]
	})

	var components = []

	return components
}

var mainApp
var gl

function main() {
	mainApp = new GlApp({ canvas: "canvas", clearColor: [0., 0., 0., 1.], animate: true })
	if (!mainApp.gl) return
	gl = mainApp.gl
	var components = createComponents(mainApp.gl)
	
	mainApp.addComponents(components)

	mainApp.run()
}
