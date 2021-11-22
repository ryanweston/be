import './style.css'

import * as THREE from 'three'
import * as dat from 'dat.gui';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';
import { randomInteger, onMouseMoved } from './controls'
import * as Tone from 'tone'

const gui = new dat.GUI();

const synth = new Tone.Synth().toDestination();

const scene = new THREE.Scene()

let params = { 
  size: 0.5,
  height: 64,
  width: 32,
  fog: 0.002,
  boundary: 2000
}

const bloom = {
  exposure: 2,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
};

// Active inputs
let active = []

// Inputs 
const input = { 
  sphere: { 
    rotationSpeed: 0.002
  }, 
  particles: { 
    rotationSpeed: 0.002
  }
}


// Objects
const group = new THREE.Group()
const cubes = []

// Lights
const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 10 );
scene.add( spotLight );



// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000)
camera.position.z = 15
camera.position.y = 3
camera.position.x = 3
scene.add(camera) 

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)


// Post-processing
let composer
const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloom.bloomThreshold;
bloomPass.strength = bloom.bloomStrength;
bloomPass.radius = bloom.bloomRadius;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

// Check if we use that input
function checkIfKey(key) {
  const now = Tone.now()
  switch (key) {
    case 'KeyA': 
      // trigger the attack immediately
      synth.triggerAttack("C4", now)
      return true;
    case 'KeyD':
      // trigger the attack immediately
      synth.triggerAttack("G4", now)
      return true;
    default: 
      return false;   
  }
}

// Event listeners
document.addEventListener('keydown', (e) => {
  let keyCheck = checkIfKey(e.code);
  if (keyCheck === true) {
    active[e.code] = true
  }
  console.log(active)
});

document.addEventListener('keyup', (e) => { 
  let keyCheck = checkIfKey(e.code);
  if (keyCheck === true) {
    active[e.code] = false
  }
  console.log(active)
});


document.addEventListener('mousemove', (e) => onMouseMoved(e, camera))


let particles = {}
function addParticles() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for ( let i = 0; i < 500; i ++ ) {

    const x = randomInteger(-params.boundary,params.boundary)
    const y = randomInteger(-params.boundary,params.boundary)
    const z = randomInteger(-params.boundary,params.boundary)

    vertices.push( x, y, z );
  }

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  const material = new THREE.PointsMaterial( { size: 1, color: 0xffffff, sizeAttenuation: false, alphaTest: 0.5} );
  material.color.setHSL( 1, 1, 1 );

  particles = new THREE.Points( geometry, material );
  scene.add( particles );
}

const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

function generateSphere() {
  const geometry  = new THREE.SphereGeometry( params.size, params.height, params.width )
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x0, metalness:0.1, roughness:0.2, opacity:0.2})
  const id = cubes.length - 1
  cubes[cubes.length] = new THREE.Mesh(geometry, material)
  const x = randomInteger(-params.boundary,params.boundary)
  const y = randomInteger(-params.boundary,params.boundary)
  const z = randomInteger(-params.boundary,params.boundary)
  cubes[id].position.set(x,y,z)
  group.add(cubes[id])

  const cube = folder.addFolder(`Cube` + ' ' + id)
  cube.add(cubes[id], 'id')
  cube.add(cubes[id].scale, 'x', 0, 10)
}

const geometry = new THREE.SphereGeometry( 500, 60, 40 );
geometry.scale( - 1, 1, 1 );

const texture = new THREE.TextureLoader().load( 'bg.jpeg' );
const material = new THREE.MeshBasicMaterial( { map: texture } );

const mesh = new THREE.Mesh( geometry, material );


function start () {				
  for (let i=0; i < 100; i++) {
    const geometry = new THREE.SphereGeometry( params.size, params.height, params.width )
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x0, metalness:0.1, roughness:0.2, opacity:0.2})
    cubes[i] = new THREE.Mesh(geometry, material)
    
    const x = randomInteger(-5,5)
    const y = randomInteger(-5,5)
    const z = randomInteger(-5,5)

    cubes[i].position.set(x,y,z)
    group.add(cubes[i])
    const cube = folder.addFolder(`Cube` + ' ' + i)
    cube.add(cubes[i], 'id')
    cube.add(cubes[i].scale, 'x', 0, 10)
  }

  // for (let i=0; i < 30; i++) {
  //   generateSphere()
  // }
  scene.add(group)
  animate()
}

function animate() {
  console.log('animate')
  // scene.fog = new THREE.FogExp2( 0x000000, params.fog );

  if (particles.rotation) {
    particles.rotation.y += input.particles.rotationSpeed
    particles.rotation.x += input.particles.rotationSpeed
  }

  mesh.rotation.y += input.sphere.rotationSpeed
  group.rotation.x += input.sphere.rotationSpeed
  group.rotation.y += input.sphere.rotationSpeed
  window.requestAnimationFrame(animate)
  composer.render();
}

// GUI
gui.add(params, 'size', 0, 30)
gui.add(params, 'height', 0, 128)
gui.add(params, 'width', 0, 64)
gui.add(params, 'fog', -0.02, 1)
let folder = gui.addFolder('Spheres')
folder.open()


start()
addParticles()






