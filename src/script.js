import './style.css'

import * as THREE from 'three'
// import * as dat from 'dat.gui';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { ShaderPass } from './postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';
import { randomInteger } from './controls'
import { config, bloom, sceneSettings } from './config'
import { Groups } from './groups'

//////////////////////////////////////
// INITIAL SETUP & VARS            //
////////////////////////////////////

var client = new WebSocket("ws://10.188.204.26:4000");
// const gui = new dat.GUI();
const scene = new THREE.Scene();

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

// 0 - Default, 1 - Adding or added, 2 - Released or releasing
let states = [0,0,0,0,0,0,0,0,0] 

// track active sensors and amount of sensors active
let currentlyPressed = [false,false,false,false,false,false,false,false,false] 
let currentlyPressedCount = 0


//////////////////////////////////////
// Lights & scene extras           //
////////////////////////////////////

// Lights
const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

// Grid helper
const gridHelper = new THREE.GridHelper( -10, 10 );


//////////////////////////////////////
// CAMERA                          //
////////////////////////////////////

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.z = 10
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

scene.background = new THREE.Color( 0x000000 );

//////////////////////////////////////
// EVENT LISTENERS                 //
////////////////////////////////////

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

function init() {

  const overlay = document.getElementById( 'overlay' );
  overlay.remove();
  //////////////////////////////////////
  // SOUND                           //
  ////////////////////////////////////


  const beesElement = document.getElementById( 'bees' )

  const birdsElement = document.getElementById( 'birds' )

  const waterElement = document.getElementById( 'water' )

  const windElement = document.getElementById( 'wind' )

  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();

  camera.add( listener )

  const bees = new THREE.Audio( listener )
  bees.setMediaElementSource(beesElement)
  bees.setLoop(true)
  bees.setVolume(1)
  beesElement.play()

  const birds = new THREE.Audio( listener )

  birds.setMediaElementSource(birdsElement)
  birds.setLoop(true)
  birds.setVolume(0)

  const water = new THREE.Audio( listener )

  water.setMediaElementSource(waterElement)
  water.setLoop(true)
  water.setVolume(0)

  const wind = new THREE.Audio( listener )

  wind.setMediaElementSource(windElement)
  wind.setLoop(true)
  wind.setVolume( 0 )
  console.log( wind.getVolume(0))
  // Define functions for pad actions
  const padActions = { 
    birds: { 
      trigger: () => {
        birdsElement.play()
      },
      release: () => {
      }
    },
    water: { 
      trigger: () => {
        waterElement.play()
      },
      release: () => {
        
      }
    },
    wind: {
      trigger: () => {
        windElement.play()
      },
      release: () => {
        
      }
    }
  }




  // Testing: Event listener for keyboard
  document.addEventListener('keydown', (e) => { 
    switch (e.code) {
      case 'KeyA': 
        trigger(0)
        break;
      case 'KeyS':
        trigger(1)
        break;
      case 'KeyD':
        trigger(2)
        break;
      case 'KeyF':
        trigger(3)
        break;
      case 'KeyG':
        trigger(4)
        break;
      case 'KeyH':
        trigger(5)
        break;
      case 'KeyJ':
        trigger(6)
        break;
      case 'KeyK':
        trigger(7)
        break;
      case 'KeyL':
        trigger(8)
        break;
      default: 
        break;
    }
  })

  // Testing: Event listener for keyboard
  document.addEventListener('keyup', (e) => { 
    switch (e.code) {
      case 'KeyA': 
        release(0)
        break;
      case 'KeyS':
        release(1)
        break;
      case 'KeyD':
        release(2)
        break;
      case 'KeyF':
        release(3)
        break;
      case 'KeyG':
        release(4)
        break;
      case 'KeyH':
        release(5)
        break;
      case 'KeyJ':
        release(6)
        break;
      case 'KeyK':
        release(7)
        break;
      case 'KeyL':
        release(8)
        break;
      default: 
        break;
    }
  })

  // Read from socket information
  client.onmessage = function (message) { 
    let data = JSON.parse(message.data)
    let sensorId = data.sensor

    console.log(message.data)

    // Check weighting is over limit
    if (data.val === "ON") { 
      trigger(sensorId)
    } else { 
      release(sensorId)
    }
  }

  function trigger (groupId) {
    states[groupId] = 1 // trigger state
      
    // if sensor is currently off
    if (currentlyPressed[groupId] === false) {
      currentlyPressed[groupId] = true
      currentlyPressedCount++
    }

    // Group has an action to perform
    if (Groups[groupId].action) {
      padActions[Groups[groupId].action].trigger()
    }

    // Group has orbs to generate
    if (!groups[groupId].children.length && Groups[groupId].orbs) {
      for (let i=0; i < 30; i++) {
        generateSphere(groupId)
      }
      scene.add(groups[groupId])
    }
}

  function release (groupId) {
    states[groupId] = 2 // release state
    currentlyPressed[groupId] = false
    currentlyPressedCount--
    if (Groups[groupId].action) {
      padActions[Groups[groupId].action].release()
    }
  }

  //////////////////////////////////////
  // OBJECTS                         //
  ////////////////////////////////////

  // Create groups
  let groups = []
  for (let i = 0; i < 9; i ++) {
    groups.push(new THREE.Group())
  }
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
    const colour = Groups[groupId].colour

    const material = new THREE.MeshStandardMaterial({ 
      color: colour,
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
    // const cube = spheresFolder.addFolder(`Cube` + ' ' + id)
    // cube.add(cubes[id], 'id')
    // cube.add(cubes[id].scale, 'x', 0, 10)
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
    // if the amount is less than 0.1 return 0.1 
    // this way the bees sound stays but diminishes quickly when stood on by a few people
    let beesVolume = 1 - (currentlyPressedCount / 4) < 0.1 ? 0.1 : 1 - (currentlyPressedCount / 6)
    bees.setVolume(beesVolume)

    let birdsVolume = currentlyPressedCount / 2 
    
    let waterVolume = currentlyPressedCount / 45

    let windVolume = currentlyPressedCount / 45

    // bad fix to problem
    if(currentlyPressed[2] === false && wind.getVolume() === 1) {
      wind.setVolume(0)
    }

    // fade in
    fadeIn(2, wind, windVolume, 0.005)

    // fade out
    fadeOut(2, wind, 0.005)


    // fade in
    fadeIn(5, water, waterVolume, 0.002)

    // fade out
    fadeOut(5, water, 0.002)
    
    // fade in
    fadeIn(6, birds, birdsVolume, 0.04)

    // fadeOut
    fadeOut(6, birds, 0.04)


    // Add fog to the scene
    // scene.fog = new THREE.FogExp2( 0x404040, sceneSettings.current.fog );

    // if (states[0] == 1) {
    //   moveParticles(groups[0].children[0].position);
    // }

    // Rotate particles
    if (particles.rotation) {
      particles.rotation.y += input.sphere.rotationSpeed
      particles.rotation.z += input.sphere.rotationSpeed
    }

    // Check group exists & handle appearing + disappearing & appearing
    states.forEach((state, index) => {
      // Ensure that orbs are already generated & it should generate orbs
      if (groups[index].children.length && Groups[index].orbs) {
        groups[index].rotation.x += input.sphere.rotationSpeed
        groups[index].rotation.y += input.sphere.rotationSpeed

        for (let i = 0; i < groups[index].children.length; i++) {
          let object = groups[index].children[i]
          if (state == 1) {
            // Check if group was off the scene, read with random positions
            if (object.material.opacity <= 0) {
              const x = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
              const y = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
              const z = randomInteger(-sceneSettings.current.boundary, sceneSettings.current.boundary)
              object.position.set(x,y,z)
            }
            // Increase opacity of the object each frame until it's 100%(1).
            if (object.material.opacity <= 1) {
              object.material.opacity += 0.005
            }
          }
          // If being release & still visible, remove
          if (state == 2 && object.material.opacity > 0) {
            object.material.opacity -= 0.005
          }
        }   
    }
    }) 
    
    window.requestAnimationFrame(animate)

    // gui.updateDisplay()
    render()
  }

  function fadeIn(groupId, sound, targetVolume, fadeInSpeed) {
    if(currentlyPressed[groupId] === true) {
      sound.setVolume(sound.getVolume() >= targetVolume ? targetVolume : sound.getVolume() + fadeInSpeed)
    }
  }

  function fadeOut(groupId, sound, fadeOutSpeed) {
    if(currentlyPressed[groupId] === false && sound.getVolume() > 0) {
      sound.setVolume(sound.getVolume() > 0 ? sound.getVolume() - fadeOutSpeed : 0)
    }
  }

  function render () {
    // Add dark materials, to change after initial bloomPass
    particles.material = darkMaterial
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2( 0x000000, sceneSettings.current.fog );
    bloomComposer.render();

    particles.material = lightMaterial
    finalComposer.render()
  }

  //////////////////////////////////////
  // GUI                             //
  ////////////////////////////////////

  // gui.add(testing, 'state').name('Testing').listen().onChange((trigger) => {
  //   if (trigger) {
  //     config.testing = bloom.testing = sceneSettings.testing = true
  //     scene.add(gridHelper)
  //   } else { 
  //     config.testing = bloom.testing = sceneSettings.testing = false
  //     scene.remove(gridHelper)
  //   }
  // })

  // let sceneFolder = gui.addFolder('Scene')
  // sceneFolder.open()
  // sceneFolder.add(sceneSettings.current, 'fog', 0, 0.2)
  // sceneFolder.add(sceneSettings.current, 'boundary', 0, 10)

  // let bloomFolder = gui.addFolder('Bloom')
  // bloomFolder.add(bloom.current, 'bloomStrength', -4, 4).listen().onChange((value) => { 
  //   bloomPass.strength = value;
  //   render();
  // })
  // bloomFolder.add(bloom.current, 'bloomThreshold', -2, 2).listen().onChange((value) => { 
  //   bloomPass.threshold = value;
  //   render();
  // })
  // bloomFolder.add(bloom.current, 'bloomRadius', -4, 4).listen().onChange((value) => { 
  //   bloomPass.radius = value;
  //   render()
  // })

  // let spheresFolder = gui.addFolder('Spheres')

  addParticles()
  start()

}





