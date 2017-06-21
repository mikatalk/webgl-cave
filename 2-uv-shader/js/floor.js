const vs = `

  precision highp float;

  uniform float time;
  uniform float sineTime;
  attribute vec4 color;

  varying vec3 vPosition;
  varying vec2 vUv;

  void main(){
    float  PI2 = 6.28;
    vUv = uv;
    vPosition = position;
    vec3 offset = vec3(0.0);
    offset.x += sin(vUv.y*PI2 + time*.25) * 5.0;
    offset.z += sin(uv.y*PI2+time*.5)*5.0;
    offset.z += cos(uv.x*PI2)*10.0;
    
    // offset.z *= abs(position.y)*5.;
    // offset.z -= 60.0 -offset.z * 10.0;
    offset.z -= 20.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + position, 1.0 );
  }

`;

const fs = `
  precision highp float;
  
  uniform float time;

  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    float  PI2 = 6.28;
    float v = 1.0/50.0 * 1.0;    
    vec4 color = vec4(1.);
    gl_FragColor = color;
    if (mod(vUv.x + v/2.0 *sin(vUv.y*PI2 + time*.25), v) > v/15.0 )
      gl_FragColor.rgba = vec4(.1,.2,.6, .4);
    gl_FragColor.a = min(gl_FragColor.a, cos( min(1.0, length(vPosition.xy)/180.0) * 3.14));  
  }

`;

class Floor {
  constructor () {

    let geometryBase = new THREE.PlaneGeometry(170, 170, 50, 50)
    let geometry = new THREE.BufferGeometry().fromGeometry( geometryBase );
    let length = geometry.attributes.position.count;
    let barycentric = new THREE.BufferAttribute(new Float32Array(length*3), 3);

    for ( let i=0, i3=0; i < length; i++, i3+=3 ) {
      barycentric.setX(i3+0, 1)
      barycentric.setY(i3+0, 0)
      barycentric.setZ(i3+0, 0)

      barycentric.setX(i3+1, 0)
      barycentric.setY(i3+1, 1)
      barycentric.setZ(i3+1, 0)

      barycentric.setX(i3+2, 0)
      barycentric.setY(i3+2, 0)
      barycentric.setZ(i3+2, 1)
    }
    geometry.addAttribute('aBarycentric', barycentric);
    
    // material
    let material = new THREE.ShaderMaterial( {
      uniforms: {
        time: { value: 1.0 },
        sineTime: { value: 1.0 },
        // mouse: { value: this.mouse },
      },
      vertexShader: vs,
      fragmentShader: fs,
      extensions: {
        derivatives: true,
      },
      side: THREE.DoubleSide,
      transparent: true,
      // wireframe: true,
    } );
    this.mesh = new THREE.Mesh( geometry, material );
  }

  update(time){
    this.mesh.material.uniforms.time.value = time
    // this.mesh.position.x = Math.sin(time*.5/50) * .25
  }
  

}
