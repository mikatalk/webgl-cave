class GL {
  
  constructor() {
    this.startTime = Date.now();
    this.init();
    this.animate();
  }

  init(){

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
    
    this.scene = new THREE.Scene();

    this.canvas = document.getElementById('gl');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      transparent: true, 
    });
    this.renderer.sortObjects = true;
    this.renderer.setSize( window.innerWidth, window.innerHeight ) ;
    this.renderer.setClearColor(0);
    // this.renderer.setPixelRatio(.5)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.addEventListener( 'change', this.render ); // remove when using animation loop
    // enable animation loop when using damping or autorotation
    //this.controls.enableDamping = true;
    //this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    this.camera.position.y = -50;
    this.camera.position.z = 10;
    this.camera.lookAt(this.scene.position);

    this.floor = new Floor;

    this.scene.add( this.floor.mesh );

    // document.body.addEventListener('touchstart', (e) => {
    //   var touchobj = e.changedTouches[0]
    //   this.setMouse(touchobj.pageX, touchobj.pageY);
    // }, false)

    // document.body.addEventListener('touchmove', (e) => {
    //   var touchobj = e.changedTouches[0];
    //   this.setMouse(touchobj.pageX, touchobj.pageY);
    //   e.preventDefault()
    // }, false)

    // document.body.addEventListener('mousemove', (e) => {
    //   this.setMouse(e.pageX, e.pageY);
    //   e.preventDefault()
    // }, false)

    window.addEventListener( 'resize', this.handleResize.bind(this), false );

  }
    
  handleResize (e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight);
  }

  animate(){
    requestAnimationFrame( this.animate.bind(this) );
    var time = performance.now();
    this.floor.mesh.material.uniforms.time.value = time * 0.007;
    this.floor.mesh.rotation.z = time *.0002
    this.renderer.render( this.scene, this.camera );
  }
}