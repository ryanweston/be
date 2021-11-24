import './style.css'

import * as THREE from 'three'
import * as dat from 'dat.gui';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';
import { randomInteger, onMouseMoved } from './controls'
import * as Tone from 'tone'

const gui = new dat.GUI();


const scene = new THREE.Scene()

let params = { 
  size: 0.5,
  height: 64,
  width: 32,
  fog: 0.1,
  boundary: 10
}

const bloom = {
  exposure: 2,
  bloomStrength: 4,
  bloomThreshold: -2,
  bloomRadius: 1
};

// Active inputs

// Inputs 
const input = { 
  sphere: { 
    rotationSpeed: 0.002
  }, 
  particles: { 
    rotationSpeed: 0.002
  }
}

let active = []
let states = [0,0] // 0 - Default, 1 - Adding or added, 2 - Released or releasing

// Objects
const groups = [new THREE.Group(), new THREE.Group()]
const cubes = []

// Lights
const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 10 );
scene.add( spotLight );

// Grid helper
// const gridHelper = new THREE.GridHelper( 10, 10 );
// scene.add( gridHelper );



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
  switch (key) {
    case 'KeyA': 
      return true;
    case 'KeyD':
      return true;
    default: 
      return false;   
  }
}

// SOUND EXPERIMENT

// const synth = new Tone.Synth().toDestination();
// const now = Tone.now()
// const notesArr = ['G4', 'C2']
// function notes (release) {
//   console.log(active)

//   if (release) {
//     console.log('ACTIVE')
//     let activeNotes = []
 
//     active.forEach((item, index) => {
//       if (item) activeNotes.push(notesArr[index])
//       if (input) synth.triggerAttack(notesArr[index], now + (index + 1))
//     })
   
//   } else {
//     let activeNotes = []
//     // for (let i = 0; i < active.length; i++) {
//     //   console.log(input)
//     //   if (input) synth.triggerAttack(notesArr[index], now)
//     // }
//     active.forEach((item, index) => {
//       if (item) activeNotes.push(notesArr[index])
//       // if (input) synth.triggerRelease(notesArr[index], now)
//     })
//     synth.triggerRelease(activeNotes, now)
//   }
// }

// Event listeners
// TRIGGER PRESS
document.addEventListener('keydown', (e) => {
  let isKey = checkIfKey(e.code);
  if (isKey) {
    switch (e.code) {
      case 'KeyA': 
        active[0] = true
        trigger(0)
        // notes(true)
        break;
      case 'KeyD':
        active[1] = true
        trigger(1)
        break;
      default: 
        break; 
    }
  }

});

// RELEASE PRESS
document.addEventListener('keyup', (e) => { 
  let isKey = checkIfKey(e.code);
  
  if (isKey) {
    switch (e.code) {
      case 'KeyA': 
        active[0] = false
        release(0)
        // notes(false)
        break;
      case 'KeyD':
        active[1] = false
        release(1)
        // notes(false)
        break;
      default: 
        break; 
    }
  }
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

function trigger (groupId) {
  console.log('TRIGGERING GROUP' + ' ' + groupId)
  states[groupId] = 1 // trigger state
  if (!groups[groupId].children.length) {
    for (let i=0; i < 100; i++) {
      generateSphere(groupId)
    }
    scene.add(groups[groupId])
  }
}

function release (groupId) {
  console.log('RELEASING GROUP' + ' ' + groupId)
  states[groupId] = 2 // release state
}

function generateSphere(groupId) {
  const geometry  = new THREE.SphereGeometry( params.size, params.height, params.width )
  const material = new THREE.MeshStandardMaterial({ 
    color: Math.random() * 0xffffff, 
    emissive: 0x0, 
    metalness:0.1, 
    roughness:0.2, 
    transparent:true, 
    opacity:0.1
  })
  
  // Set to array so we can access from outside scope
  const id = cubes.length
  cubes[cubes.length] = new THREE.Mesh(geometry, material)

  // Set random position
  const x = randomInteger(-params.boundary, params.boundary)
  const y = randomInteger(-params.boundary, params.boundary)
  const z = randomInteger(-params.boundary, params.boundary)
  cubes[id].position.set(x,y,z)

  // Add to group
  groups[groupId].add(cubes[id])

  // Add to GUI
  const cube = folder.addFolder(`Cube` + ' ' + id)
  cube.add(cubes[id], 'id')
  cube.add(cubes[id].scale, 'x', 0, 10)
}

function start () {			
  // Generate initial 100 spheres
  animate()
}

function animate() {
  scene.fog = new THREE.FogExp2( 0x000000, params.fog );

  if (particles.rotation) {
    particles.rotation.y += input.particles.rotationSpeed
    particles.rotation.x += input.particles.rotationSpeed
  }

  states.forEach((state, index) => {
    // if (groups[index]) {
    //   groups[index].rotation.x += input.sphere.rotationSpeed
    //   groups[index].rotation.y += input.sphere.rotationSpeed
    // }
    for (let i = 0; i < groups[index].children.length; i++) {
      let object = groups[index].children[i]
      if (state == 1) {
        if (object.material.opacity <= 1) object.material.opacity += 0.005
      }
      if (state == 2) {
        object.material.opacity -= 0.005
        if (object && object.material.opacity <= 0.01) {
          // Look at alternative: instead of removing, look to keep low opacity and randomise coordinates if
          // sphere is already generated
          groups[index].remove(object)
        }
      }
    }   
  }) 
  
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






