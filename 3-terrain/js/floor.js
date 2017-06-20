const vs = `

  precision highp float;

  uniform float time;
  uniform float sineTime;
  attribute vec4 color;

  varying vec3 vCamPos;
  varying vec3 vPosition;
  varying vec2 vUv;

// float rand(vec2 co){
//     return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
// }

// 2D Random
float random (in vec2 st) { 
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners porcentages
    return mix(a, b, u.x) + 
            (c - a)* u.y * (1.0 - u.x) + 
            (d - b) * u.x * u.y;
}

  void main(){
    float  PI2 = 6.28;
    vUv = uv;
    vec3 offset = vec3(0.0);


    // jiglle horizontally
    offset.x += sin(vUv.y*PI2 + time*.25) * 5.0;
    offset.x *= ((sin(uv.x*PI2) + sin(time*.1)*.3 + sin(time*.05)*.4 ) ) * 2.0;
   


    offset.z += sin(uv.y*PI2+time*.25)*5.0;
    offset.z += cos(uv.x*PI2)*10.0;
    offset.z += cos(uv.x*PI2 + sin(time*.015+.25)*.3 + sin(time*.15+.25)*.4 )*10.0;
    offset.z += .5; // prevent line over 0.0

    // offset.z += rand(position.xy*vec2(100.0))* 1.0;

// vec2 st = gl_FragCoord.xy/u_resolution.xy;
offset.z += noise(uv.xy*vec2(.01)+vec2(time*.2))* 1.0;

    // offset.z *= abs(position.y)*5.;
    // offset.z -= 60.0 -offset.z * 10.0;
    // offset.z -= 20.0;
    offset.z *= 1.6;
    // offset.z += position.z;//*PI2)*10.0;
    
    vPosition = offset + position;

vCamPos = cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(  vPosition, 1.0 );
  }

`;

const fs = `
  precision highp float;
  
  uniform float time;

  varying vec3 vCamPos;
  varying vec3 vPosition;
  varying vec2 vUv;


  void main() {
    float  PI2 = 6.28;
    float v = 2.0;//1.0/50.0 * 1.0;    
    vec4 color = vec4(0.);
    if ( vPosition.z < -20.0 ) // water level
      color = vec4(0.15, 0.1, 0.3, 1.0);
      // discard;
    else if (mod(vPosition.z, v) < v/3.0 )
      color.rgba = vec4(.5, .5, .9, 1.0);
    // else 
    else
      discard;
      // color = vec4(0.2, 0.8, 0.2, .2);
    // color.r = rand(vPosition.xy);
    gl_FragColor = color;
    // gl_FragColor.a = clamp(distance(vPosition.xyz, vCamPos.xyz) / 250., 0.0, 1.0) ;

    // gl_FragColor.a = min(gl_FragColor.a, cos( min(1.0, distance( vCamPos.xy, vPosition.xy)/2000.0 ) * 3.14));  
    // gl_FragColor.a = min(gl_FragColor.a, cos( min(1.0, distance( vCamPos.xy, vPosition.xy)/2000.0 ) * 3.14));  
    gl_FragColor.a = min(gl_FragColor.a, cos( min(1.0, length(vPosition.xy)/250.0) * 3.14));  
  }

`;

class Floor {
  constructor () {

    let geometryBase = new THREE.PlaneGeometry(180, 500, 50, 50)
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
      // side: THREE.DoubleSide,
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