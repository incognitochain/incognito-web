import model from '../../model/device.glb';


var container, stats, controls;
var camera, scene, renderer;


function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
  camera.position.set( - 1.8, 0.9, 2.7 );

  scene = new THREE.Scene();

  var loader = new THREE.GLTFLoader().setPath( '' );
    loader.load( model, function ( gltf ) {

      gltf.scene.traverse( function ( child ) {

        if ( child.isMesh ) {

          child.material.envMap = envMap;

        }

      } );

      scene.add( gltf.scene );

    } );
    texture.encoding = THREE.RGBEEncoding;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.flipY = true;

    var cubeGenerator = new THREE.EquirectangularToCubeGenerator( texture, { resolution: 1024 } );
    cubeGenerator.update( renderer );

    var pmremGenerator = new THREE.PMREMGenerator( cubeGenerator.renderTarget.texture );
    pmremGenerator.update( renderer );

    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    pmremCubeUVPacker.update( renderer );

    var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );

  // var loader = new THREE.RGBELoader().setPath( '' );
  // loader.load(model, function ( texture ) {

    // texture.encoding = THREE.RGBEEncoding;
    // texture.minFilter = THREE.NearestFilter;
    // texture.magFilter = THREE.NearestFilter;
    // texture.flipY = true;

    // var cubeGenerator = new THREE.EquirectangularToCubeGenerator( texture, { resolution: 1024 } );
    // cubeGenerator.update( renderer );

    // var pmremGenerator = new THREE.PMREMGenerator( cubeGenerator.renderTarget.texture );
    // pmremGenerator.update( renderer );

    // var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    // pmremCubeUVPacker.update( renderer );

    // var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;

  //   // model

  //   var loader = new THREE.GLTFLoader().setPath( '' );
  //   loader.load( model, function ( gltf ) {

  //     gltf.scene.traverse( function ( child ) {

  //       if ( child.isMesh ) {

  //         child.material.envMap = envMap;

  //       }

  //     } );

  //     scene.add( gltf.scene );

  //   } );

  //   pmremGenerator.dispose();
  //   pmremCubeUVPacker.dispose();

  //   scene.background = cubeGenerator.renderTarget;

  // } );

  // renderer = new THREE.WebGLRenderer( { antialias: true } );
  // renderer.setPixelRatio( window.devicePixelRatio );
  // renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.gammaOutput = true;
  // container.appendChild( renderer.domElement );

  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.target.set( 0, - 0.2, - 0.2 );
  // controls.update();

  // window.addEventListener( 'resize', onWindowResize, false );

  // // stats
  // stats = new Stats();
  // container.appendChild( stats.dom );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

// function animate() {

//   requestAnimationFrame( animate );

//   renderer.render( scene, camera );

//   stats.update();

// }


function start() {
  if (typeof THREE === 'undefined')
    return;

    init();
    // animate();
}

start();