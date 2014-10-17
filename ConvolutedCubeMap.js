function ConvolutedCubeMap(sourceCubMap, resolution, blurStrength, iterations, type) {
	resolution = resolution || 64;
	this.iterations = iterations || 2;
	this.blurStrength = blurStrength || .5;
	type = type || THREE.FloatType;
	this.sourceCubMap = sourceCubMap;

	this.scene = new THREE.Scene();

	this.shader = require('./ConvolutionCubeShader');
	this.cubeMapToRerender = this.shader.uniforms["tCube"];
	this.shader.uniforms["tFlip"].value = 1;
	this.shader.uniforms["brightness"].value = .16666;
	this.shader.uniforms["blurStrength"].value = this.blurStrength;
	this.cubeMapToRerender.value = sourceCubMap;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: this.shader.fragmentShader,
		vertexShader: this.shader.vertexShader,
		uniforms: this.shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide

	} );

	this.mesh = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), material );
	this.scene.add( this.mesh );

	this.cameraA = new THREE.CubeCamera(.01, 2, resolution, type);
	this.cameraB = new THREE.CubeCamera(.01, 2, resolution, type);
	this.scene.add(this.cameraA);
	this.scene.add(this.cameraB);
	this.cubeMap = this.cameraA.renderTarget;
}

ConvolutedCubeMap.prototype = {
	update: function(renderer) {
		this.shader.uniforms["blurStrength"].value = this.blurStrength;
		this.cubeMapToRerender.value = this.sourceCubMap;
		for (var i = this.iterations; i >= 0; i--) {
			this.cameraA.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraA.renderTarget;
			this.shader.uniforms["blurStrength"].value *= .6666;
			this.cameraB.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraB.renderTarget;
			this.shader.uniforms["blurStrength"].value *= .6666;
		};
	}
}

module.exports = ConvolutedCubeMap;