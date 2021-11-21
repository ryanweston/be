import './style.css'

import * as THREE from 'three'
import * as dat from 'dat.gui';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';

const gui = new dat.GUI();

const scene = new THREE.Scene()

let params = { 
  size: 1,
  height: 64,
  width: 32,
  fog: 0.002
}

const bloom = {
  exposure: 2,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
};

let composer

// Objects
const group = new THREE.Group()


const cubes = []

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 10 );
scene.add( spotLight );


// Inputs 
const input = { 
  sphere: { 
    rotationSpeed: 0.002
  }, 
  particles: { 
    rotationSpeed: 0.002
  }
}

document.addEventListener('keypress', logKey);

function logKey(e) {
  switch (e.code) {

  }
    
  console.log(e.code)
}

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100)
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

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloom.bloomThreshold;
bloomPass.strength = bloom.bloomStrength;
bloomPass.radius = bloom.bloomRadius;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

document.addEventListener('mousemove', (e) => onMouseMoved(e))


function onMouseMoved(e) {
  camera.position.x =  e.clientX / (window.innerWidth)
  camera.position.y =  - e.clientY / (window.innerHeight)
}

let particles = {}
function addParticles() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for ( let i = 0; i < 500; i ++ ) {

    const x = randomInteger(-30,30)
    const y = randomInteger(-30,30)
    const z = randomInteger(-30,30)

    vertices.push( x, y, z );
  }

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  const material = new THREE.PointsMaterial( { size: 1, color: 0xffffff, sizeAttenuation: false, alphaTest: 0.5} );
  material.color.setHSL( 1, 1, 1 );

  particles = new THREE.Points( geometry, material );
  console.log(particles)
  scene.add( particles );
}

function generateSphere() {
  const geometry  = new THREE.SphereGeometry( params.size, params.height, params.width )
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x0, metalness:0.1, roughness:0.2, opacity:0.2})
  const id = cubes.length - 1
  cubes[cubes.length] = new THREE.Mesh(geometry, material)
  const x = randomInteger(-20,20)
  const y = randomInteger(-20,20)
  const z = randomInteger(-20,20)
  console.log(cubes[id])
  cubes[id].position.set(x,y,z)
  group.add(cubes[id])

  const cube = folder.addFolder(`Cube` + ' ' + id)
  cube.add(cubes[id], 'id')
  cube.add(cubes[id].scale, 'x', 0, 10)
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const geometry = new THREE.SphereGeometry( 500, 60, 40 );
geometry.scale( - 1, 1, 1 );

const texture = new THREE.TextureLoader().load( 'bg.jpeg' );
const material = new THREE.MeshBasicMaterial( { map: texture } );

const mesh = new THREE.Mesh( geometry, material );

// scene.add( mesh );

function start () {
				// invert the geometry on the x-axis so that all of the faces point inward
				

  for (let i=0; i < 2; i++) {
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

  for (let i=0; i < 30; i++) {
    generateSphere()
  }
  scene.add(group)
  animate()
}

// function transition() {
//   let max = params.fog
//   scene.fog = new THREE.FogExp2( 0x000000, max)
//   for 
// }

function animate() {
scene.fog = new THREE.FogExp2( 0x000000, params.fog );

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
console.log(cubes)






