import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { DrawHMI } from './sun';
import data from './lines.json'

const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let width = 10;
let height = 1080/1920 * 10;
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new TrackballControls(camera, renderer.domElement);

camera.position.z = 15;

const geometry = new THREE.SphereGeometry( 0.01, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );
sphere.position.x = 1

DrawHMI(scene, new Date("2023-06-27 16:40:00"));

// TODO: Draw magnetic field lines
const x = data['fieldlines']['lines']['0']['x'];
const y = data['fieldlines']['lines']['0']['y'];
const z = data['fieldlines']['lines']['0']['z'];

console.log(data['fieldlines']['lines'].length)
for(let i = 0; i < data['fieldlines']['lines'].length; i++){

  const x = data['fieldlines']['lines'][i.toString()]['y'];
  const z = data['fieldlines']['lines'][i.toString()]['x'];
  const y = data['fieldlines']['lines'][i.toString()]['z'];
  const curvePoints = [];
  for (let i = 0; i < x.length; i++) {
    curvePoints.push(new THREE.Vector3(x[i], y[i], z[i]));
    console.log(x[i], y[i], z[i]);
  }
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  const points = curve.getPoints( 50 );
  const geometry1 = new THREE.BufferGeometry().setFromPoints( points );

  const material1 = new THREE.LineBasicMaterial( { color: 0xff0000 } );

  // Create the final object to add to the scene
  const curveObject = new THREE.Line( geometry1, material1 );
  // plane.add(curveObject);
  scene.add(curveObject);
}


function animate() {
	requestAnimationFrame( animate );

    controls.update();
	renderer.render( scene, camera );
}

animate();