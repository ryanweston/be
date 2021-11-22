export function randomInteger (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function onMouseMoved (e, camera) {
  camera.position.x =  e.clientX / (window.innerWidth)
  camera.position.y =  - e.clientY / (window.innerHeight)
}
