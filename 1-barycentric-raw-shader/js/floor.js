const vs = `

  precision highp float;

  uniform float time;
  uniform float sineTime;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 aBarycentric;
  attribute vec3 position;
  attribute vec4 color;

  varying vec4 vColor;
  varying vec3 vPosition;
  varying vec3 vBC;

  void main(){

    vBC = aBarycentric;
    vPosition = position;
    vec3 offset = vec3(0.0);
    offset.z += 6.0 * cos( min(1.0, length(vPosition.xy)/180.0) * 3.14);

offset.z += sin(time*.005*0.005*position.x*position.y*position.y)* 10.0;

    vColor = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + position, 1.0 );
  }

`;

const fs = `
  precision highp float;
  
  uniform float time;

  varying vec4 vColor;
  varying vec3 vPosition;
  varying vec3 vBC;

  void main() {
    vec4 color = vec4(0.1, .2, 1.0, 1.0);
    // vec4 color = vec4( vColor )*.5;
    // color.a =  vPosition.z / 100.0;
    gl_FragColor = color;

    // if( !any( lessThan( vBC, vec3(abs(sin(time*.7))*.3, abs(sin(time*.9))*.3, abs(sin(time*.11))*.3) ))) {
    if( !any( lessThan( vBC, vec3(0.005 )))) {
      discard;
    }

    gl_FragColor.a = cos( min(1.0, length(vPosition.xy)/180.0) * 3.14);

    // gl_FragColor.a =1.0;// color.a;//1.0;//length(color);
    // gl_FragColor.rgb = vec3(1.0) - vColor.rgb;
    // gl_FragColor.rgb *=  vPosition.z / 100.0;
    
  }

`;

class Floor {
  constructor () {

    // let triangles = 1;
    // let instances = 1000;
    // let numGrid = Math.floor(Math.sqrt(instances))
    // let geometry = new THREE.InstancedBufferGeometry();
    // let size = 40;
    // let halfSize = size/2;
    // geometry.maxInstancedCount = instances; 
    // let vertices = new THREE.BufferAttribute( new Float32Array([
    //   // top
    //   -halfSize, halfSize, 0,
    //   halfSize, halfSize, 0,
    //   0, 0, 0,
    //   // right
    //   -halfSize, -halfSize, 0,
    //   -halfSize, halfSize, 0,
    //   0, 0, 0,
    //   // bottom
    //   -halfSize, -halfSize, 0,
    //   halfSize, -halfSize, 0,
    //   0, 0, 0,
    //   // left
    //   halfSize, -halfSize, 0,
    //   halfSize, halfSize, 0,
    //   0, 0, 0,
    // ]), 3 );
    // geometry.addAttribute( 'position', vertices );
    // let offsets = new THREE.InstancedBufferAttribute( new Float32Array( instances * 3 ), 3, 1 );
    // let alignOffset = -(numGrid*size/2 - halfSize);
    // for ( let i=0, l = offsets.count; i < l; i++ ) {
    //   offsets.setXYZ( i, alignOffset+(i%numGrid)*size, alignOffset+(Math.floor(i/numGrid)%numGrid)*size, i/l);
    // }
    // geometry.addAttribute( 'offset', offsets );
    // let colors = new THREE.InstancedBufferAttribute( new Float32Array( instances * 4 ), 4, 1 );
    // for ( let i = 0, l = colors.count; i < l; i++ ) {
    //   colors.setXYZW( i, Math.random(),i/l, .7, 1);
    // }
    // geometry.addAttribute( 'color', colors );
    // // this.mouse = new THREE.Vector2(.5,.5)

    let geometryBase = new THREE.PlaneGeometry(170, 170, 50, 50)



    // let geo = new THREE.CubeGeometry(300, 300, 300, 1, 1, 1);
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
    let material = new THREE.RawShaderMaterial( {
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
  

}
