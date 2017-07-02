class GL {
  
  constructor() {
    this.startTime = Date.now();
    this.init();
    this.animate();
  }

  init(){
    let halfWidth = window.innerWidth/2;
    let halfHeight = window.innerHeight/2;

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 20000 );
    
    this.scene = new THREE.Scene();

    this.canvas = document.getElementById('gl');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      transparent: true, 
    });
    this.renderer.sortObjects = true;
    this.renderer.setSize( window.innerWidth, window.innerHeight ) ;
    // this.renderer.setClearColor(0xffffff);
    // this.renderer.setClearColor(0x130c25);
    this.renderer.setClearColor(0);
    // this.renderer.setPixelRatio(.5)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.addEventListener( 'change', this.render ); // remove when using animation loop
    // enable animation loop when using damping or autorotation
    this.controls.enableDamping = true;
    //this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.enableRotate = false;

    this.camera.position.y = -350;
    this.camera.position.z = 100;
    this.camera.lookAt(this.scene.position);

    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer = new THREE.EffectComposer( this.renderer );
    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    let effect = new THREE.ShaderPass( THREE.CopyShader );
    effect.renderToScreen = true;
    this.composer.addPass( effect );

    // let effect = new THREE.ShaderPass( THREE.RGBShiftShader );
    // effect.uniforms[ 'amount' ].value = 0.0015;
    // effect.renderToScreen = true;
    // this.composer.addPass( effect );

    // let effect = new THREE.ShaderPass( THREE.BrightnessContrastShader );
    // effect.uniforms[ 'brightness' ].value = 0;
    // effect.uniforms[ 'contrast' ].value = 2.5;
    // effect.renderToScreen = true;
    // this.composer.addPass( effect );

    // let effect = new THREE.ShaderPass( THREE.DotScreenShader );
    // effect.uniforms[ 'scale' ].value = 4;
    // effect.renderToScreen = true;
    // this.composer.addPass( effect );

    
    this.floor = new Floor;

    this.scene.add( this.floor.mesh );

    window.addEventListener( 'resize', this.handleResize.bind(this), false );

  }
    
  handleResize (e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight);
    // this.floor.updateAspectRatio(this.camera.aspect);

    // let halfWidth = window.innerWidth/2;
    // let halfHeight = window.innerHeight/2;
    // this.composer.setSize(halfWidth, halfHeight);

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.composer.setSize( window.innerWidth, window.innerHeight );
  }

  // setMouse (x,y){
  //   this.mouse.setX( (x-window.innerWidth/2) / window.innerWidth * 2 );
  //   this.mouse.setY( (y-window.innerHeight/2) / window.innerHeight * 2 );
  // }

  animate(){
    requestAnimationFrame( this.animate.bind(this) );
    // this.controls.update();
    // console.log(this.camera.rotation)
    // this.camera.position.x = Math.sin(time*.5)*40;

    var time = performance.now();
    this.floor.update( time * 0.007);
// this.floor.mesh.rotation.z = time *.0002
    this.composer.render();
    // this.renderer.render( this.scene, this.camera );
  }
}