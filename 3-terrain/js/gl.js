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

    this.floor = new Floor;

    this.scene.add( this.floor.mesh );

    window.addEventListener( 'resize', this.handleResize.bind(this), false );

    window.app = this;
  }
    
  handleResize (e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight);
  }

  animate () {
    requestAnimationFrame( this.animate.bind(this) );
    
    var time = performance.now();
    this.floor.update( time * 0.007);
    this.renderer.render( this.scene, this.camera );
  }
}