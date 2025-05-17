import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Green Ground
const groundGeometry = new THREE.PlaneGeometry( 10, 10 );
const groundMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const ground = new THREE.Mesh( groundGeometry, groundMaterial );
ground.rotation.x = - Math.PI / 2; // Rotate to be horizontal
scene.add( ground );

// Random Flowers
function addFlower() {
  const stemHeight = Math.random() * 0.5 + 0.3;
  const stemRadius = 0.02;
  const petalRadius = Math.random() * 0.1 + 0.05;
  const petalColor = new THREE.Color(Math.random() * 0xffffff);

  // Stem
  const stemGeometry = new THREE.CylinderGeometry( stemRadius, stemRadius, stemHeight, 32 );
  const stemMaterial = new THREE.MeshBasicMaterial( { color: 0x228B22 } );
  const stem = new THREE.Mesh( stemGeometry, stemMaterial );

  // Flower Head (simple circle for now)
  const headGeometry = new THREE.CircleGeometry( petalRadius, 32 );
  const headMaterial = new THREE.MeshBasicMaterial( { color: petalColor, side: THREE.DoubleSide } );
  const head = new THREE.Mesh( headGeometry, headMaterial );
  head.position.y = stemHeight;

  const flower = new THREE.Group();
  flower.add( stem );
  flower.add( head );

  // Random Position
  const x = (Math.random() - 0.5) * 8;
  const z = (Math.random() - 0.5) * 8;
  flower.position.set( x, 0, z );
  scene.add( flower );
}

const numberOfFlowers = 20;
for (let i = 0; i < numberOfFlowers; i++) {
  addFlower();
}

// Circle (Bee)
const circleGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
const circleMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const circle = new THREE.Mesh( circleGeometry, circleMaterial );
circle.position.set( 1, 0.5, 1 ); // Initial position
scene.add( circle );

camera.position.set( 3, 2, 5 );
camera.lookAt( scene.position );

function animate() {
  requestAnimationFrame( animate );

  // You can add animation to the circle (bee) here if you like
  // circle.position.x += 0.01;

  renderer.render( scene, camera );
}

// instantiate a loader
const loader = new OBJLoader();

// load a resource
loader.load(
	// resource URL
	'models/tree.obj',
	// called when resource is loaded
	function ( object ) {

    object.scale.setScalar(0.1);
		scene.add( object );

	},
	// called when loading is in progress
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );
    console.log(error)

	}
);


function addLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 20)

    scene.add(ambientLight)
}

addLights(scene);
animate();
