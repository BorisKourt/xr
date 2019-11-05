var camera, scene, renderer, container, textureEquirec, equirectMaterial;
var canvas2, ctx;

const frame_rate = 23;

var controller1, controller2;
var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();
var group, slides;
var cubeCamera, cubeCameraB;
var material;
var count = 0;
var images = [];
var imageTextures = [];

var count = 0, cubeCamera1, cubeCamera2;
var reflection_material;

var current_360 = -1;
var next_360 = 0;

var show_grid = false;
var frame_motion = 20;

var og = new THREE.Vector3();

const slideActions = new Map([
  [ 0, function() {
    next_360 = 0;
    frame_motion = 0;
  }],
  [ 1, function() {
    next_360 = 1;
    frame_motion = 0;
  }],
  [ 2, function() {
    next_360 = 2;
    frame_motion = 0;
  }],
  [ 4, function() {
    next_360 = 3;
    frame_motion = 0;
  }],
  [ 5, function() {
    next_360 = 2;
    frame_motion = 0;
  }],
  [ 6, function() {
    next_360 = 4;
    frame_motion = 0;
  }],
  [ 7, function() {
    next_360 = 5;
    frame_motion = 0;
  }],
  [ 8, function() {
    next_360 = 6;
    frame_motion = 0;
  }],
  [ 9, function() {
    next_360 = 7;
    frame_motion = 0;
  }],
  [ 10, function() {
    next_360 = 4;
    frame_motion = 0;
  }],
  [ 11, function() {
    next_360 = 8;
    frame_motion = 0;
  }],
  [ 12, function() {
    next_360 = 1;
    frame_motion = 0;
  }],
  [ 13, function() {
    next_360 = 9;
    frame_motion = 0;
  }]
]);

var skyboxes = [
  'images/winter_night_in_the_mountains_1572887777.jpg',
  'images/arne_ekeland_kulltippen_1572884209.jpg',
  'images/arne_ekeland_bygningsarbeidere_1572884477.jpg',
  'images/arne_ekeland_fergemann_1572884455.jpg',
  'images/arne_ekeland_jernbanestasjon_1572884230.jpg',
  'images/arne_ekeland_henrettelse_1572884282.jpg',
  'images/arne_ekeland_kvinne_ved_sjoen_1572884058.jpg',
  'images/frans_widerberg_1572887473.jpg',
  'images/vinter_i_kragero_1572887254.jpg',
  'images/strandlandskap_med_traer_og_bater_1572887282.jpg'
];

var clock = new THREE.Clock(true);
clock.getDelta();

init();
animate();


function init() {
  var textureLoader = new THREE.TextureLoader();

  canvas2 = document.createElement('canvas');

  // Second Canvas
  if (canvas2.getContext) {
    ctx = canvas2.getContext('2d', { antialias: false, alpha: false});

    canvas2.width = 4096;
    canvas2.height = 2048;

    canvas2.style.position = "absolute";

    for (var i = 0; i < skyboxes.length; i++) {
      images[i] = new Image() ;
      images[i].src = skyboxes[i];
      //imageTextures[i] = textureLoader.load( skyboxes[i] );
    }

  }


  document.body.appendChild( canvas2 );

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  var canvas = document.createElement( 'canvas' );
  canvas.style.position = "absolute";

  var context = canvas.getContext( 'webgl2', { antialias: false, alpha: false } );
  renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = false;
  renderer.vr.enabled = true;
  container.appendChild( renderer.domElement );

  textureEquirec = new THREE.CanvasTexture(canvas2);

  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.magFilter = THREE.LinearFilter;
  textureEquirec.minFilter = THREE.NearestFilter;
  textureEquirec.needsUpdate = true;

  var equirectShader = THREE.ShaderLib[ "equirect" ];

  var equirectMaterial = new THREE.ShaderMaterial( {
    fragmentShader: equirectShader.fragmentShader,
    vertexShader: equirectShader.vertexShader,
    uniforms: equirectShader.uniforms,
    depthWrite: true,
    side: THREE.BackSide
  });

  equirectMaterial.uniforms[ "tEquirect" ].value = textureEquirec;

  Object.defineProperty( equirectMaterial, 'map', {
    get: function () {

      return this.uniforms.tEquirect.value;

    }
  });

  /*
  equirectMaterial = new THREE.MeshBasicMaterial( {
    map: textureEquirec
  } );
  */

  var geometry2 = new THREE.SphereBufferGeometry( 100, 60, 40 );
  // invert the geometry on the x-axis so that all of the faces point inward
  // geometry2.scale( -1, 1, 1 );

  cubeMesh = new THREE.Mesh( geometry2, equirectMaterial );
  cubeMesh.material = equirectMaterial;
  cubeMesh.visible = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.05, 200 );
  /*

  cubeCamera1 = new THREE.CubeCamera( 1, 1000, 256 );
  cubeCamera1.renderTarget.texture.generateMipmaps = true;
  cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  scene.add( cubeCamera1 );

  cubeCamera2 = new THREE.CubeCamera( 1, 1000, 256 );
  cubeCamera2.renderTarget.texture.generateMipmaps = true;
  cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  scene.add( cubeCamera2 );
  reflection_material = new THREE.MeshBasicMaterial( {
					envMap: cubeCamera2.renderTarget.texture
  });
  */

  scene.add(cubeMesh);

  slides = new THREE.Group();
  scene.add( slides );

  //const test_slide = textureLoader.load( "slides/slide2.png" );

  var slideImages = [
    textureLoader.load( "slides/slide0-fs8.png" ),
    textureLoader.load( "slides/slide1-fs8.png" ),
    textureLoader.load( "slides/slide2-fs8.png" ),
    textureLoader.load( "slides/slide3-fs8.png" ),
    textureLoader.load( "slides/slide4-fs8.png" ),
    textureLoader.load( "slides/slide5-fs8.png" ),
    textureLoader.load( "slides/slide6-fs8.png" ),
    textureLoader.load( "slides/slide7-fs8.png" ),
    textureLoader.load( "slides/slide8-fs8.png" ),
    textureLoader.load( "slides/slide9-fs8.png" ),
    textureLoader.load( "slides/slide10-fs8.png" ),
    textureLoader.load( "slides/slide11-fs8.png" ),
    textureLoader.load( "slides/slide12-fs8.png" ),
    textureLoader.load( "slides/slide13-fs8.png" )
  ];

  const plane_geo = new THREE.PlaneGeometry( 4, 2 );
  const dragger_geo = new THREE.BoxBufferGeometry( 0.1, 1.63, 0.003 );

  group = new THREE.Group();
  scene.add( group );

  for ( var i = 0; i < slideImages.length; i ++ ) {

    const material_dragger = new THREE.MeshStandardMaterial(
      { roughness: 0.0,
        metalness: 0.9,
        color: 0xC96055,
        //envMap: textureEquirec
        envMap: equirectMaterial.map
      } );
    const dragger = new THREE.Mesh(dragger_geo, material_dragger);
    dragger.userData.id = i;

    const obj = new THREE.Mesh(
      plane_geo,
      new THREE.MeshBasicMaterial({
        //premultipliedAlpha: true,
        depthWrite: true,
        //alphaMap: alpha_node,
        color: 0xffffff,
        map: slideImages[i],
        side: THREE.DoubleSide,
        transparent: true}));

    obj.position.x = 2.05;
    obj.position.y = 0.18;

    dragger.add(obj);

    dragger.position.x = -2;
    dragger.position.y = 1;
    dragger.position.z = -3 + -(0.07 * i);

    group.add(dragger);

  }

  var geometries = [
    new THREE.CylinderBufferGeometry( 0.4, 0.4, 0.005, 64 ),
    new THREE.SphereBufferGeometry( 0.4, 32, 32)
  ];

  for ( var i = 0; i < 16; i ++ ) {

    var geometry = geometries[ 0 ];
    var material_group;

    material_group = new THREE.MeshStandardMaterial(
      { roughness: 0.0,
        metalness: 0.9,
        //envmap: textureequirec
        envMap: equirectMaterial.map
      } );

    var object = new THREE.Mesh( geometry, material_group);

    object.position.x = Math.random() * 40 - 20;
    object.position.z = Math.random() * 40 - 20;

    if (i % 2 == 0) {
      object.position.y = Math.random() * -20 - 4;
    } else {
      object.position.y = Math.random() * 20 + 4;
    }

    object.lookAt(og);
    object.rotation.z = Math.PI / 4;
    object.rotation.x = Math.PI / 4;
    object.rotation.y = Math.PI / 4;
    object.scale.setScalar( Math.random() * 7 + 1 );
    object.userData.name = "reflector";

    group.add( object );

  }

  for ( var i = 0; i < skyboxes.length; i ++ ) {

    var n = i % skyboxes.length;
    var geometry = geometries[ 1 ];
    var material_group;

    /*
    material_group = new THREE.MeshBasicMaterial({
      map: imageTextures[n],
      depthWrite: true,
      color: 0xffffff,
      transparent: true,
      side: THREE.BackSide
    });
    */

    material_group = new THREE.MeshStandardMaterial(
      { roughness: 0.0,
        metalness: 0.9,
        //envmap: textureequirec
        envMap: equirectMaterial.map
      } );

    var object = new THREE.Mesh( geometry, material_group );

    object.position.x = Math.random() * 8 - 4;
    object.position.z = Math.random() * 8 - 4;

    if (i % 2 == 0) {
      object.position.y = Math.random() * -10 - 1;
    } else {
      object.position.y = Math.random() * 10 + 1;
    }
    //object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    //object.rotation.z = Math.random() * 2 * Math.PI;
    object.scale.setScalar( Math.random() * 3 + 1 );

    object.userData.id = 100 + n;

    group.add( object );

  }

  document.body.appendChild( THREE.WEBVR.createButton( renderer ) );

  controller1 = renderer.vr.getController( 0 );
  controller1.addEventListener( 'selectstart', onSelectStart );
  controller1.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller1 );

  controller2 = renderer.vr.getController( 1 );
  controller2.addEventListener( 'selectstart', onSelectStart );
  controller2.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller2 );

  var geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

  var line = new THREE.Line( geometry );
  line.name = 'line';
  line.scale.z = 5;

  controller1.add( line.clone() );
  controller2.add( line.clone() );

  raycaster = new THREE.Raycaster();

  window.addEventListener( 'resize', onWindowResize, false );

}


function onSelectStart( event ) {

  var controller = event.target;

  var intersections = getIntersections( controller );

  if ( intersections.length > 0 ) {

    var intersection = intersections[ 0 ];

    tempMatrix.getInverse( controller.matrixWorld );

    var object = intersection.object;
    object.matrix.premultiply( tempMatrix );
    object.matrix.decompose( object.position, object.quaternion, object.scale );

    if (object.material.emissive) {
      object.material.emissive.b = 1;
    } else {
      object.material.color.setHex(0xff0000);
    }

    controller.add( object );

    controller.userData.selected = object;

  }

}

function onSelectEnd( event ) {

  var controller = event.target;

  if ( controller.userData.selected !== undefined ) {

    var object = controller.userData.selected;
    object.matrix.premultiply( controller.matrixWorld );
    object.matrix.decompose( object.position, object.quaternion, object.scale );
    if (object.material.emissive) {
      object.material.emissive.b = 0;
    } else {
      object.material.color.setHex(0xffffff);
    }
    if (slideActions.has(object.userData.id)) {
      slideActions.get(object.userData.id)();
    }

    group.add( object );

    controller.userData.selected = undefined;

  }


}

function getIntersections( controller ) {

  tempMatrix.identity().extractRotation( controller.matrixWorld );

  raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
  raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

  return raycaster.intersectObjects( group.children);

}

function intersectObjects( controller ) {

  // Do not highlight when already selected

  if ( controller.userData.selected !== undefined ) return;

  var line = controller.getObjectByName( 'line' );
  var intersections = getIntersections( controller );

  if ( intersections.length > 0 ) {

    var intersection = intersections[ 0 ];

    var object = intersection.object;
    if (object.material.emissive) {
      object.material.emissive.r = 1;
    } else {
      object.material.color.setHex(0x0000ff);
    }
    intersected.push( object );

    line.scale.z = intersection.distance;

  } else {

    line.scale.z = 5;

  }

}

function cleanIntersected() {

  while ( intersected.length ) {

    var object = intersected.pop();
    if (object.material.emissive) {
      object.material.emissive.r = 0;
    } else {
      object.material.color.setHex(0xffffff);
    }

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  renderer.setAnimationLoop( render );
}

var previous_clock = 0;
function render() {

  cleanIntersected();

  intersectObjects( controller1 );
  intersectObjects( controller2 );

  const time = performance.now() * 0.00001;

  // 2D Canvas Loop for Texure Effects
  const elapsed = clock.getElapsedTime();
  if (elapsed - previous_clock >= 1.0 / frame_rate) {
    previous_clock = elapsed;

    if (current_360 != next_360) {

      frame_motion++;

      if (frame_motion == 20) {
        current_360 = next_360;
      }

      ctx.globalAlpha = frame_motion / 20.0;
      ctx.drawImage(images[next_360], 0, 0);
      textureEquirec.needsUpdate = true;

    } else if (show_grid) {
      if (frame_motion != 20) {
        frame_motion++;
      }
    } else if (!show_grid) {
      if (frame_motion != 20) {
        frame_motion++;
      }
    }


  }

    /*
  for (var i = 0; i < group.children.length; i++) {
    if (group.children[i].userData.name == "reflector") {
      group.children[i].visible = false;
    }
  }

  if ( count % 2 === 0 ) {
    reflection_material.envMap = cubeCamera1.renderTarget.texture;
    cubeCamera2.update( renderer, scene );
  } else {
    reflection_material.envMap = cubeCamera2.renderTarget.texture;
    cubeCamera1.update( renderer, scene );
  }

  count ++;

  for (var i = 0; i < group.children.length; i++) {
    if (group.children[i].userData.name == "reflector") {
      group.children[i].visible = true;
    }
  }
  */


  renderer.render( scene, camera );

}
