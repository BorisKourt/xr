var camera, scene, renderer, container, textureEquirec, equirectMaterial;
var canvas2, ctx;

var controller1, controller2;
var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();
var group, slides;
var cubeCamera, cubeCameraB;
var material;
var count = 0;
var images = [];

var current_360 = 1;
var next_360 = 1;

const slideActions = new Map([
  [ 0, function() {
    next_360 = 3;
  }],
  [ 1, function() {
    next_360 = 2;
  }]
]);

var clock = new THREE.Clock(true);
clock.getDelta();

init();
animate();

function init() {

  canvas2 = document.createElement('canvas');

  // Second Canvas
  if (canvas2.getContext) {
    ctx = canvas2.getContext('2d', { antialias: false, alpha: false });

    canvas2.width = 4096;
    canvas2.height = 2048;

    canvas2.style.position = "absolute";

    ctx.fillStyle = "rgba(200, 200, 0, 0.5)";
    ctx.fillRect(0, 0, 4096, 2048);

    //Loading of the home test image - img1
    images.push(new Image());
    images[0].src = 'images/0__D5AgPtPU4AACFMi_1572276799.jpg';
    images.push(new Image());
    images[1].src = 'images/balkestetindfog_1572276651.jpg';
    images.push(new Image());
    images[2].src = 'images/boygen2_1572276679.jpg';
    images.push(new Image());
    images[3].src = 'images/lars_hertervig_the_tarn_1572276611.jpg';
    images.push(new Image());
    images[4].src = 'images/odd_nerdrum_selvportrett_1572276574.jpg';
    images.push(new Image());
    images[5].src = 'images/vg1_1572276735.jpg';

    //drawing of the test image - img1
    images[0].onload = function () {
      //draw background image
      ctx.drawImage(images[0], 0, 0);
    };

  }

  var textureLoader = new THREE.TextureLoader();

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
  //textureEquirec.magFilter = THREE.LinearFilter;
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

  scene.add(cubeMesh);

  slides = new THREE.Group();
  scene.add( slides );

  const test_slide = textureLoader.load( "slides/slide2.png" );

  var slideImages = [
    textureLoader.load( "slides/slide1.png" ),
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide,
    test_slide
  ];

  const plane_geo = new THREE.PlaneGeometry( 4, 2 );
  const dragger_geo = new THREE.BoxBufferGeometry( 0.1, 1.63, 0.003 );

  group = new THREE.Group();
  scene.add( group );

  for ( var i = 0; i < slideImages.length; i ++ ) {

    const material_dragger = new THREE.MeshStandardMaterial(
      { roughness: 0.05,
        metalness: 0.9,
        //envMap: textureEquirec
        envMap: equirectMaterial.map
      } );
    const dragger = new THREE.Mesh(dragger_geo, material_dragger);
    dragger.userData.id = i;

    const obj = new THREE.Mesh(
      plane_geo,
      new THREE.MeshBasicMaterial({
        premultipliedAlpha: true,
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
    dragger.position.z = -2.5 + -(0.075 * i);

    /*
    dragger.rotation.x = Math.random() * 2 * Math.PI;
    dragger.rotation.y = Math.random() * 2 * Math.PI;
    */


    group.add(dragger);

  }

  var geometries = [
    new THREE.CylinderBufferGeometry( 0.4, 0.4, 0.005, 32 ),
    new THREE.IcosahedronBufferGeometry( 0.4, 3 )
  ];

  for ( var i = 0; i < 32; i ++ ) {

    var geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
    var material_group = new THREE.MeshStandardMaterial(
      { roughness: 0.0,
        metalness: 0.9,
        //envMap: textureEquirec
        envMap: equirectMaterial.map
      } );

    var object = new THREE.Mesh( geometry, material_group );

    if (i % 2 == 0) {
      object.position.x = Math.random() * 10 - 5;
      object.position.y = Math.random() * -5;
      object.position.z = Math.random() * -5 - 0.5;
    } else {
      object.position.x = Math.random() * 10 - 5;
      object.position.y = Math.random() * 5;
      object.position.z = Math.random() * 5 + 0.5;
    }

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.setScalar( Math.random() + 0.5 );

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
    object.material.emissive.b = 1;
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
    object.material.emissive.b = 0;

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
    object.material.emissive.r = 1;
    intersected.push( object );

    line.scale.z = intersection.distance;

  } else {

    line.scale.z = 5;

  }

}

function cleanIntersected() {

  while ( intersected.length ) {

    var object = intersected.pop();
    object.material.emissive.r = 0;

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

var frame = 0;
var frame_rate = 23;
var blender = 1;
var frame_motion = 0;
var current_360 = 1;
var next_360 = 1;

function render() {

  cleanIntersected();

  intersectObjects( controller1 );
  intersectObjects( controller2 );

  var time = performance.now() * 0.00001;

  // Animate other canvas at a different frame rate.
  if (clock.oldTime >= 1.0 / frame_rate) {
    clock.getDelta();

    if (current_360 != next_360) {

      frame_motion++;

      if (frame_motion == 20) {
        frame_motion = 0;
        current_360 = next_360;
      }
      //ctx.save()
      ctx.globalAlpha = frame_motion / 20.0;
      ctx.drawImage(images[next_360], 0, 0);
      //ctx.restore()
    }
    textureEquirec.needsUpdate = true;

  }

  renderer.render( scene, camera );

}
