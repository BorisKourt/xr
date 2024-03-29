var renderer = null,
  scene = null,
  cameraLeft = null,
  cameraRight = null,
  objects = {},
  zincrement = 0.01,
  //separation = -0.04300000000000005,
  separation = 0.04200000000000005,
  incrementation = 0.001,
  animating = false;

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
var imageTextures = [];

function onLoad()
{
  var textureLoader = new THREE.TextureLoader();
  for (var i = 0; i < skyboxes.length; i++) {
    imageTextures[i] = textureLoader.load( skyboxes[i] );
  }
  // Grab our containers div
  var container = document.getElementById("container");
  var canvas = document.createElement( 'canvas' );
  var context = canvas.getContext( 'webgl2', { alpha: false, antialias: true } );
  renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );

  // Create the Three.js renderers, add them to our divs
  //renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor(new THREE.Color().setRGB(0,0,0));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.shadowMap.enabled = true;
  //renderer.physicallyCorrectLights = true
  container.appendChild( renderer.domElement );

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Put in two cameras
  cameraLeft = new THREE.PerspectiveCamera( 42, (container.offsetWidth / 2) / container.offsetHeight, 0.1, 400 );
  cameraLeft.position.set(0,0,1);
  scene.add(cameraLeft);

  cameraRight = new THREE.PerspectiveCamera( 42, (container.offsetWidth / 2) / container.offsetHeight, 0.1, 400);
  cameraRight.position.set(0,0,1);
  scene.add(cameraRight);

  iluminateSomething();

  drawSomething();

  addKeyHandler();
  // Run our render loop
  run();
}

var framecounter = 0;

function run()
{
  //framecounter++;

  var width = Math.round(container.offsetWidth/2),
    height = container.offsetHeight;
  // Render the scene
  renderer.setViewport( 0, 0, width, height);
  renderer.setScissor( 0, 0, width, height);
  renderer.setScissorTest ( true );

  cameraLeft.aspect = width * 2 / height;
  cameraLeft.updateProjectionMatrix();
  cameraLeft.position.set( separation, 0, 2.8 );

  renderer.render( scene, cameraLeft );

  renderer.setViewport( width, 0, width, height);
  renderer.setScissor( width, 0, width, height);
  renderer.setScissorTest ( true );

  cameraRight.aspect = width * 2 / height;
  cameraRight.updateProjectionMatrix();
  cameraRight.position.set( -separation, 0, 2.8 );

  renderer.render( scene, cameraRight );

  /*

  if (framecounter % 2 == 0) {
    cameraRight.position.set( -separation, 0, 3 );
    renderer.render( scene, cameraRight );
  } else {
    cameraLeft.position.set( separation, 0, 3 );
    renderer.render( scene, cameraLeft );
  }

  setTimeout(run, 0);
  */
  /*
  var width = Math.round(container.offsetWidth/2),
    height = container.offsetHeight;
  // Render the scene
  renderer.setViewport( 0, 0, 1920, 1080);
  renderer.setScissor( 0, 0, 1920, 1080);
  renderer.setScissorTest ( true );

  cameraLeft.aspect = 1920 / 1080;
  cameraLeft.updateProjectionMatrix();
  cameraLeft.position.set( separation, 0, 3.1 );

  renderer.render( scene, cameraLeft );

  renderer.setViewport( 0, 1080 + 45, 1920, 1080);
  renderer.setScissor( 0, 1080, 1920, 1080);
  renderer.setScissorTest ( true );

  cameraRight.aspect = 1920 / 1080;
  cameraRight.updateProjectionMatrix();
  cameraRight.position.set( -separation, 0, 3.1 );

  renderer.render( scene, cameraRight );
  */
  animateSomething();

  //setTimeout( function() {

  requestAnimationFrame( run );

  //},  1000 / 60);
}

function drawSomething(){

  var planetOrbitGroup = new THREE.Object3D();
  for ( var i = 0; i < 0; i ++ ) {

    var n = i % skyboxes.length;
    var geometry = new THREE.SphereBufferGeometry( 0.025 * i + 0.3, 64, 64)

    var material_group = new THREE.MeshBasicMaterial({
      map: imageTextures[n],
      depthWrite: true,
      color: 0xffffff,
      transparent: true
      //side: THREE.BackSide
    });

    var object = new THREE.Mesh( geometry, material_group );

    var s = Math.PI * (0.5 - Math.random()) * 2.5;
    var t = Math.PI * (0.5 - Math.random()) * 2.5;
    var r = 1;

    object.position.x = r * Math.cos(s) * Math.sin(t);
    object.position.y = r * Math.sin(s) * Math.sin(t) * 0.5;
    object.position.z = r * Math.cos(t);

    planetOrbitGroup.add( object );
  }

  var geometry = new THREE.TorusKnotGeometry( 0.55, 0.1, 1024, 512);
  var material = new THREE.MeshPhysicalMaterial( {
    map: imageTextures[2],
    normalMap: imageTextures[1],
    displacementMap: imageTextures[0],
    emissiveMap: imageTextures[3],
    displacementScale: 0.04,
    aoMap: imageTextures[4],
    color: 0xffffff,
    emissive: 0x222222,
    envMap: imageTextures[5],
    lightMap: imageTextures[6],
    roughnessMap: imageTextures[7],
    lightMapIntensity: 0.5,
    metalness: 0.9,
    normalScale: new THREE.Vector2( 0.8, 0.8 )
  });
  var material2 = new THREE.MeshPhysicalMaterial( {
    map: imageTextures[7],
    normalMap: imageTextures[9],
    displacementMap: imageTextures[8],
    emissiveMap: imageTextures[2],
    emissiveIntensity: 2.1,
    displacementScale: 0.04,
    aoMap: imageTextures[3],
    color: 0xffffff,
    emissive: 0x222222,
    envMap: imageTextures[4],
    envMapIntensity: 2.0,
    lightMap: imageTextures[1],
    roughnessMap: imageTextures[1],
    lightMapIntensity: 0.5,
    metalness: 0.9,
    normalScale: new THREE.Vector2( 0.8, 0.8 )
  });
  var torusKnot = new THREE.Mesh( geometry, material2 );
  torusKnot.receiveShadow = true;
  torusKnot.castShadow = true;
  planetOrbitGroup.add( torusKnot );

  var torusKnot2 = new THREE.Mesh( geometry, material2 );
  torusKnot2.rotation.x = 2.1;
  torusKnot2.receiveShadow = true;
  torusKnot2.castShadow = true;
  planetOrbitGroup.add( torusKnot2 );

  var torusKnot3 = new THREE.Mesh( geometry, material2 );
  torusKnot3.rotation.y = -2.1;
  torusKnot3.receiveShadow = true;
  torusKnot3.castShadow = true;
  planetOrbitGroup.add( torusKnot3);


  objects.clock = new THREE.Clock();

  scene.add(planetOrbitGroup);
  objects.planetOrbitGroup = planetOrbitGroup;

}

var rotator = 0;
function animateSomething(){
  /*
  var theta = objects.clock.getElapsedTime() / 10000;
  rotator++;
  var loc = rotator / 10000000;
  var x = cameraLeft.position.x;
  var z = cameraLeft.position.z;
  cameraLeft.position.x = x * Math.cos(loc) + z * Math.sin(loc);
  cameraLeft.position.z = z * Math.cos(loc) - x * Math.sin(loc);
  cameraLeft.lookAt(0,0,0);

  x = cameraRight.position.x;
  z = cameraRight.position.z;
  cameraRight.position.x = x * Math.cos(loc) + z * Math.sin(loc);
  cameraRight.position.z = z * Math.cos(loc) - x * Math.sin(loc);
  cameraRight.lookAt(0,0,0);
  */
  objects.planetOrbitGroup.children[0].rotation.x += 0.0001;
  objects.planetOrbitGroup.children[1].rotation.y += 0.0007;
  objects.planetOrbitGroup.children[2].rotation.z += 0.0003;
  objects.planetOrbitGroup.rotation.y += 0.0005;

}

function iluminateSomething(){
  var spotLight = new THREE.SpotLight( 0xffffff, 2.0 );
  spotLight.position.set( 3, 3, 0.5);

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 0.01;
  spotLight.shadow.camera.far = 600;
  spotLight.shadow.camera.fov = 30;
  scene.add(spotLight);

  var spotLight2 = new THREE.SpotLight( 0xffffff, 3.0 );
  spotLight2.position.set( 10, 3, 0.5);
  spotLight2.castShadow = false;
  scene.add(spotLight2);

  var spotLight3 = new THREE.SpotLight( 0xffffff, 4.0 );
  spotLight3.position.set( -0.1, 0.1, 20);
  spotLight3.castShadow = false;
  scene.add(spotLight3);
}

function addKeyHandler()
{
  document.addEventListener( 'keyup', onKeyUp, false);
}

function onKeyUp	(event)
{
  event.preventDefault();

  switch(event.keyCode){
    case 38: //Up
      separation += incrementation;
      break;
    case 40: //Down
      separation -= incrementation;
      break;
    case 39: //Right
      incrementation *= 1.1;
      break;
    case 37:// left
      incrementation *= 0.9;
      break;
  }
}

onLoad();
