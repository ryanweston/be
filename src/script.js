import './style.css'

import * as THREE from 'three'
import * as dat from 'dat.gui';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { ShaderPass } from './postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';
import { randomInteger, onMouseMoved } from './controls'
import { config, bloom, sceneSettings } from './config'

//////////////////////////////////////
// INITIAL SETUP & VARS            //
////////////////////////////////////

var client = new WebSocket("ws://10.188.204.47:4000");
const gui = new dat.GUI();
const scene = new THREE.Scene()

// Testing toggle 
let testing = { 
  state: false
}

// Inputs 
const input = { 
  sphere: { 
    rotationSpeed: 0.001
  }, 
  particles: { 
    rotationSpeed: 0.001
  }
}

// Array storing current active inputs
let active = [0,0,0,0,0,0,0,0,0] 
// 0 - Default, 1 - Adding or added, 2 - Released or releasing
let states = [0,0,0,0,0,0,0,0,0] 

//////////////////////////////////////
// Lights & scene extras           //
////////////////////////////////////

// Lights
const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

// Grid helper
const gridHelper = new THREE.GridHelper( 10, 10 );

//////////////////////////////////////
// CAMERA                          //
////////////////////////////////////

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000)
camera.position.z = 15
camera.position.y = 3
camera.position.x = 3
scene.add(camera) 

///////////////////////////////////////
// RENDERER                        //
////////////////////////////////////

const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)

//////////////////////////////////////
// POST-PROCESSING                 //
////////////////////////////////////

// Use render pass to provide rendered scene as an input
const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloom.current.bloomThreshold;
bloomPass.strength = bloom.current.bloomStrength;
bloomPass.radius = bloom.current.bloomRadius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), "baseTexture"
);

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass )

//////////////////////////////////////
// EVENT LISTENERS                 //
////////////////////////////////////

// Camera movement
document.addEventListener('mousemove', (e) => onMouseMoved(e, camera))

// Read from socket information
client.onmessage = function (message) { 
  let data = JSON.parse(message.data)
  let sensorId = data.sensor

  // Check weighting is over limit
  if (data.val > 100) { 
    active[sensorId] = true
    trigger(sensorId)
  } else { 
    active[sensorId] = false
    release(sensorId)
  }
}

function trigger (groupId) {
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

//////////////////////////////////////
// OBJECTS                         //
////////////////////////////////////

const groups = [new THREE.Group(), new THREE.Group()]
const cubes = []

const darkMaterial = new THREE.PointsMaterial( { size: 0.75, color: 0x000000, sizeAttenuation: false, alphaTest: 0.5, fog: false} );
const lightMaterial = new THREE.PointsMaterial( { size: 0.75, color: 0xFFFF00, sizeAttenuation: false, alphaTest: 0.5, fog: false} );
let particles;
let geometry;

function addParticles() {
  geometry = new THREE.BufferGeometry();
  const vertices = [];

  for ( let i = 0; i < 500; i ++ ) {
    const x = randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary)
    const y = randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary)
    const z = randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary)

    vertices.push( x, y, z );
  }

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  particles = new THREE.Points( geometry, darkMaterial );
  scene.add( particles );
}

function generateSphere(groupId) {
  const geometry  = new THREE.SphereGeometry( config.current.size, config.current.height, config.current.width )
  const material = new THREE.MeshStandardMaterial({ 
    color: Math.random() * 0xffffff,
    metalness:0, 
    roughness:0, 
    transparent:true, 
    opacity:0
  })
  
  // Set to array so we can access from outside scope
  const id = cubes.length
  cubes[cubes.length] = new THREE.Mesh(geometry, material)

  // Set random position
  const x = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
  const y = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
  const z = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
  cubes[id].position.set(x,y,z)

  // Add to group
  groups[groupId].add(cubes[id])

  // Add to GUI
  const cube = spheresFolder.addFolder(`Cube` + ' ' + id)
  cube.add(cubes[id], 'id')
  cube.add(cubes[id].scale, 'x', 0, 10)
}

function moveParticles(position) {
  let vertices = []
  for (let i = 0; i < 500; i++) {
    let newPos = defineRange([position.x, position.y, position.z])
    vertices.push(...newPos)
  }

  let float = new THREE.Float32BufferAttribute( vertices, 3 )
  particles.geometry.setAttribute('position', float);
  particles.geometry.attributes.position.needsUpdate = true;
}

function defineRange(position) {
  const range = 1
  let newPositions = []
  position.forEach((item) => {
     const upper = item + range
     const lower = item - range
     newPositions.push(randomInteger(lower, upper))
  })

  return newPositions
}

//////////////////////////////////////
// RENDERING                       //
////////////////////////////////////

function start () {
  animate()
}

function animate() {
  scene.fog = new THREE.FogExp2( 0x000000, sceneSettings.current.fog );

  if (states[0] == 1) {
    // moveParticles(groups[0].children[0].position);
  }

  if (particles.rotation) {
    particles.rotation.y += input.sphere.rotationSpeed
    particles.rotation.z += input.sphere.rotationSpeed
  }

  states.forEach((state, index) => {
    if (groups[index]) {
      
      if (index == 1) {
        groups[index].rotation.y += input.sphere.rotationSpeed / 2
        groups[index].rotation.z += input.sphere.rotationSpeed
      }
      groups[index].rotation.x += input.sphere.rotationSpeed
      groups[index].rotation.y += input.sphere.rotationSpeed
    }

    for (let i = 0; i < groups[index].children.length; i++) {
      let object = groups[index].children[i]
      if (state == 1) {
        if (object.material.opacity <= 0) {
          const x = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
          const y = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
          const z = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
          object.position.set(x,y,z)
        }
        if (object.material.opacity <= 1) {
          object.material.opacity += 0.005
        }
      }
      if (state == 2 && object.material.opacity > 0) {
        object.material.opacity -= 0.005
      }
    }   
  }) 
  
  window.requestAnimationFrame(animate)

  gui.updateDisplay()
  render()
}

function render () { 
  particles.material = darkMaterial
  bloomComposer.render();
  particles.material = lightMaterial
  finalComposer.render()
}

//////////////////////////////////////
// GUI                             //
////////////////////////////////////

gui.add(testing, 'state').name('Testing').listen().onChange((trigger) => {
  if (trigger) {
    config.testing, bloom.testing, sceneSettings.testing = true
    scene.add(gridHelper)
  } else { 
    config.testing, bloom.testing, sceneSettings.testing = false
    scene.remove(gridHelper)
  }
})

let sceneFolder = gui.addFolder('Scene')
sceneFolder.open()
sceneFolder.add(sceneSettings.current, 'fog', 0, 0.2)
sceneFolder.add(sceneSettings.current, 'boundary', 0, 10)

// gui.add(config.current, 'size', 0, 30)
// gui.add(config.current, 'height', 0, 128)
// gui.add(config.current, 'width', 0, 64)

let bloomFolder = gui.addFolder('Bloom')
bloomFolder.add(bloom.current, 'bloomStrength', -4, 4).listen().onChange((value) => { 
  console.log('CHANGE')
  bloomPass.strength = value;
  render();
})
bloomFolder.add(bloom.current, 'bloomThreshold', -2, 2).listen().onChange((value) => { 
  bloomPass.threshold = value;
	render();
})
bloomFolder.add(bloom.current, 'bloomRadius', -4, 4).listen().onChange((value) => { 
  bloomPass.radius = value;
  render()
})

let spheresFolder = gui.addFolder('Spheres')

addParticles()
start()






