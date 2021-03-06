

// PASS 1 - Mouse Map
const vertexMouseMap = `
  uniform vec2 mouse;
  varying vec2 vUv;
  varying vec2 vMouse;
  void main() {
    vUv = uv;
    vMouse = mouse;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
const fragmentMouseMap = `
  varying vec2 vUv;
  varying vec2 vMouse;
  uniform float time;
  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    color.r += 1.0 - distance(vUv.xy, vMouse.xy) * 10.0;
    gl_FragColor = vec4(color, 1.0);
  }
`;


// PASS 2 - Ping Pong
const vertexPingPong = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
const fragmentPingPong = `
  varying vec2 vUv;
  uniform sampler2D mouseMap;
  uniform sampler2D previousFrame;
  // uniform float time;
  void main() {
    // gl_FragColor = texture2D( mouseMap, vUv );
    gl_FragColor = mix( texture2D( mouseMap, vUv ), texture2D( previousFrame, vUv ), .97);
    // if ( gl_FragColor.r < .1 ) discard;
    // gl_FragColor = texture2D( mouseMap, vUv );
    // gl_FragColor += texture2D( previousFrame, vUv );

    // vec3 color = vec3(0.0, 0.0, 0.0);
    // color.r += 1.0 - distance(vUv.xy, vMouse.xy) * 10.0;
    // gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
`;


// PASS 3 - FINAL - simply copy the latest rtt to screen buffer  
const vertexFinalScreen = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
const fragmentFinalScreen = `
  varying vec2 vUv;
  uniform sampler2D merged;
  void main() {
    // gl_FragColor = mix( texture2D( texturePrevious, vUv ), texture2D( textureCurrent, vUv ), .25);
    gl_FragColor = texture2D( merged, vUv );
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
`;

class GL {
  
  constructor() {
    this.startTime = Date.now();
    this.init();
    this.animate();
  }

  init(){

    // start up with default mouse pos mid screen
    this.mouseX = this.mouseY = .5;

    this.halfWidth = window.innerWidth/2;
    this.halfHeight = window.innerHeight/2;

    this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

    this.sceneMouseMap = new THREE.Scene();
    this.scenePingPong = new THREE.Scene();
    this.sceneFinalScreen = new THREE.Scene();

    // create a mouse position with velocity map on Green & Blue channels (velX, velY) => (g,b)
    this.rtTextureMouseMap = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
    this.materialMouseMap = new THREE.ShaderMaterial( {
      uniforms: { 
        time: { value: 0.0 },
        mouse: { value: new THREE.Vector2(this.mouseX, this.mouseY) }
      },
      vertexShader: vertexMouseMap,
      fragmentShader: fragmentMouseMap,
      depthWrite: false
    } );


    // two textures for one RTT material, toggle on each frame
    this.rtTextureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
    this.rtTextureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
    this.materialPingPong = new THREE.ShaderMaterial( {
      uniforms: { 
        mouseMap: { value: this.rtTextureMouseMap.texture },
        previousFrame: { value: null },
      },
      vertexShader: vertexPingPong,
      fragmentShader: fragmentPingPong,
      depthWrite: false
    } );
    this.pingPongToggle = !false; // one toggle forthe ping pong process

    // one final material for merging current/previous 
    this.materialFinalScreen = new THREE.ShaderMaterial( {
      uniforms: { 
        merged: { value: null }, // pingpong rttA/rttB  
      },
      vertexShader: vertexFinalScreen,
      fragmentShader: fragmentFinalScreen,
      depthWrite: false
    } );

    let plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight);

    let quad = null;

    quad = new THREE.Mesh( plane, this.materialMouseMap );
    this.sceneMouseMap.add( quad );

    quad = new THREE.Mesh( plane, this.materialPingPong );
    this.scenePingPong.add( quad );

    quad = new THREE.Mesh( plane, this.materialFinalScreen );
    this.sceneFinalScreen.add( quad );

    this.canvas = document.getElementById('gl');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      transparent: true,
      autoClear: false,
    });
    this.renderer.setSize( window.innerWidth, window.innerHeight ) ;
    // this.renderer.setClearColor(0xffffff);
    // this.renderer.setClearColor(0x130c25);
    // this.renderer.setClearColor(0);
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(.5)
    // this.renderer.setPixelRatio(1)
    // this.renderer.setPixelRatio(window.devicePixelRatio || 1);

    document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
    window.addEventListener( 'resize', this.handleResize.bind(this), false );

  }
  
  onDocumentMouseMove ( event ) {
    this.mouseX = event.clientX / window.innerWidth;
    this.mouseY = 1.0 - event.clientY / window.innerHeight;
    this.materialMouseMap.uniforms.mouse.value.x = this.mouseX;
    this.materialMouseMap.uniforms.mouse.value.y = this.mouseY;
  }

  handleResize (e) {
    this.halfWidth = window.innerWidth/2;
    this.halfHeight = window.innerHeight/2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight);
  }

  animate (elapsedTime) {

    requestAnimationFrame( this.animate.bind(this) );

    // - PASS 1 - mouse map
    // create mouse map of position and velocity 
    // - PASS 2 - ping pong
    // apply new mouse map to previous frame buffer 
    // save buffer onto current frame
    // - PASS 3 - Final to screen
    // copy current frame to screen
    // toggle current/previous refs

    // this.renderer.clear();

    // PASS 1
    this.materialMouseMap.uniforms.time.value = elapsedTime * 0.0001;
    this.renderer.render( this.sceneMouseMap, this.camera, this.rtTextureMouseMap, false );
    // PASS 2
    this.materialPingPong.uniforms.previousFrame.value = this.pingPongToggle ? this.rtTextureA.texture : this.rtTextureB.texture;
    this.renderer.render( this.scenePingPong, this.camera, !this.pingPongToggle ? this.rtTextureA : this.rtTextureB, false );
    this.pingPongToggle = !this.pingPongToggle;    
    // PASS 3    
    this.materialFinalScreen.uniforms.merged.value = this.pingPongToggle ? this.rtTextureA.texture : this.rtTextureB.texture;
    this.renderer.render( this.sceneFinalScreen, this.camera );

    // this.pingPongToggle != this.pingPongToggle;    

    
  }
}