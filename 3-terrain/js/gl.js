class GL {
  
  constructor() {
    this.startTime = Date.now();
    this.init();
    this.animate();
  }

  init(){

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
    this.renderer.setClearColor(0x130c25);
    // this.renderer.setPixelRatio(.5)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.addEventListener( 'change', this.render ); // remove when using animation loop
    // enable animation loop when using damping or autorotation
    this.controls.enableDamping = true;
    //this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.enableRotate = false;

    this.camera.position.y = -160;
    this.camera.position.z = 20;
    this.camera.lookAt(this.scene.position);

    this.floor = new Floor;

    this.scene.add( this.floor.mesh );

    window.addEventListener( 'resize', this.handleResize.bind(this), false );

    window.app = this;
  }
    
  handleResize (e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight);
    // this.floor.updateAspectRatio(this.camera.aspect);
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
    this.renderer.render( this.scene, this.camera );
  }
}