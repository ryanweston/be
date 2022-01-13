import"./style.css";import*as THREE from"three";import{EffectComposer}from"./postprocessing/EffectComposer.js";import{RenderPass}from"./postprocessing/RenderPass.js";import{ShaderPass}from"./postprocessing/ShaderPass.js";import{UnrealBloomPass}from"./postprocessing/UnrealBloomPass.js";import{randomInteger}from"./controls";import{config,bloom,sceneSettings}from"./config";import{Groups}from"./groups";var client=new WebSocket("ws://10.188.204.18:4000");const scene=new THREE.Scene,input={sphere:{rotationSpeed:.001},particles:{rotationSpeed:.001}};let states=[0,0,0,0,0,0,0,0,0],currentlyPressed=[!1,!1,!1,!1,!1,!1,!1,!1,!1],currentlyPressedCount=0,orbGroups=[];for(let e=0;e<9;e++)orbGroups.push(new THREE.Group);const orbs=[];let particleGroups=[];for(let e=0;e<10;e++)particleGroups.push(new THREE.Group);const particles=[],light=new THREE.AmbientLight(4210752);scene.add(light);const camera=new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,1,100);camera.position.z=10,camera.position.y=3,camera.position.x=3,scene.add(camera);const canvas=document.querySelector(".webgl"),renderer=new THREE.WebGLRenderer({canvas,antialias:!0});renderer.setSize(window.innerWidth,window.innerHeight);const renderScene=new RenderPass(scene,camera),bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),1.5,.4,.85);bloomPass.threshold=bloom.current.bloomThreshold,bloomPass.strength=bloom.current.bloomStrength,bloomPass.radius=bloom.current.bloomRadius;const bloomComposer=new EffectComposer(renderer);bloomComposer.renderToScreen=!1,bloomComposer.addPass(renderScene),bloomComposer.addPass(bloomPass);const finalPass=new ShaderPass(new THREE.ShaderMaterial({uniforms:{baseTexture:{value:null},bloomTexture:{value:bloomComposer.renderTarget2.texture}},vertexShader:document.getElementById("vertexshader").textContent,fragmentShader:document.getElementById("fragmentshader").textContent,defines:{}}),"baseTexture"),finalComposer=new EffectComposer(renderer);finalComposer.addPass(renderScene),finalComposer.addPass(finalPass),scene.background=new THREE.Color(0);const startButton=document.getElementById("startButton");function init(){document.getElementById("overlay").remove();const e=document.getElementById("bees"),r=document.getElementById("birds"),t=document.getElementById("water"),n=document.getElementById("wind"),o=new THREE.AudioListener;camera.add(o);const s=new THREE.Audio(o);s.setMediaElementSource(e),s.setLoop(!0),s.setVolume(1),e.play();const a=new THREE.Audio(o);a.setMediaElementSource(r),a.setLoop(!0),a.setVolume(0);const c=new THREE.Audio(o);c.setMediaElementSource(t),c.setLoop(!0),c.setVolume(0);const i=new THREE.Audio(o);i.setMediaElementSource(n),i.setLoop(!0),i.setVolume(0);const u={birds:{trigger:()=>{r.play()},release:()=>{}},water:{trigger:()=>{t.play()},release:()=>{}},wind:{trigger:()=>{n.play()},release:()=>{}}};function l(e){if(states[e]=1,!1===currentlyPressed[e]&&(currentlyPressed[e]=!0,currentlyPressedCount++),Groups[e].action&&u[Groups[e].action].trigger(),!orbGroups[e].children.length&&Groups[e].orbs){for(let r=0;r<30;r++)b(e);scene.add(orbGroups[e])}scene.getObjectByName(e.toString())||(particleGroups[e].children.length||g(e),scene.add(particleGroups[e]))}function d(e){states[e]=2,currentlyPressed[e]=!1,currentlyPressedCount--,Groups[e].action&&u[Groups[e].action].release()}document.addEventListener("keydown",(e=>{switch(e.code){case"KeyA":l(0);break;case"KeyS":l(1);break;case"KeyD":l(2);break;case"KeyF":l(3);break;case"KeyG":l(4);break;case"KeyH":l(5);break;case"KeyJ":l(6);break;case"KeyK":l(7);break;case"KeyL":l(8)}})),document.addEventListener("keyup",(e=>{switch(e.code){case"KeyA":d(0);break;case"KeyS":d(1);break;case"KeyD":d(2);break;case"KeyF":d(3);break;case"KeyG":d(4);break;case"KeyH":d(5);break;case"KeyJ":d(6);break;case"KeyK":d(7);break;case"KeyL":d(8)}})),client.onmessage=function(e){let r=JSON.parse(e.data),t=r.sensor;console.log(e.data),"ON"===r.val?l(t):d(t)};const p=new THREE.PointsMaterial({size:.75,color:0,sizeAttenuation:!1,alphaTest:.5,fog:!1}),m=new THREE.PointsMaterial({size:.75,color:16776960,sizeAttenuation:!1,alphaTest:.5,fog:!1});function g(e){let r=new THREE.BufferGeometry;const t=[];for(let e=0;e<70;e++){const e=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),r=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),n=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary);t.push(e,r,n)}r.setAttribute("position",new THREE.Float32BufferAttribute(t,3));const n=particles.length;particles[n]=new THREE.Points(r,p),particleGroups[e].add(particles[n]),particleGroups[e].name=n.toString()}function b(e){const r=new THREE.SphereGeometry(config.current.size,config.current.height,config.current.width),t=Groups[e].colour(),n=new THREE.MeshStandardMaterial({color:t,metalness:0,roughness:0,transparent:!0,opacity:0}),o=orbs.length;orbs[o]=new THREE.Mesh(r,n);const s=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),a=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),c=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary);orbs[o].position.set(s,a,c),orbGroups[e].add(orbs[o])}function y(e,r,t,n){!0===currentlyPressed[e]&&r.setVolume(r.getVolume()>=t?t:r.getVolume()+n)}function E(e,r,t){!1===currentlyPressed[e]&&r.getVolume()>0&&r.setVolume(r.getVolume()>0?r.getVolume()-t:0)}g(9),scene.add(particleGroups[9]),function e(){let r=1-currentlyPressedCount/4<.1?.1:1-currentlyPressedCount/6;s.setVolume(r);let t=currentlyPressedCount/2,n=currentlyPressedCount/45,o=currentlyPressedCount/45;!1===currentlyPressed[2]&&1===i.getVolume()&&i.setVolume(0),y(2,i,o,.005),E(2,i,.005),y(5,c,n,.002),E(5,c,.002),y(6,a,t,.04),E(6,a,.04),particleGroups.forEach(((e,r)=>{particleGroups[r].children.length&&(particleGroups[r].rotation.y+=input.sphere.rotationSpeed,particleGroups[r].rotation.z+=input.sphere.rotationSpeed)})),states.forEach(((e,r)=>{if(orbGroups[r].children.length&&Groups[r].orbs){orbGroups[r].rotation.x+=input.sphere.rotationSpeed,orbGroups[r].rotation.y+=input.sphere.rotationSpeed;for(let t=0;t<orbGroups[r].children.length;t++){let n=orbGroups[r].children[t];if(1==e){if(n.material.opacity<=0){const e=Groups[r].colour();n.material.colour=e;const t=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),o=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary),s=randomInteger(-sceneSettings.current.boundary,sceneSettings.current.boundary);n.position.set(t,o,s)}n.material.opacity<=1&&(n.material.opacity+=.005)}2==e&&(scene.remove(particleGroups[r]),n.material.opacity>0&&(n.material.opacity-=.005))}}})),window.requestAnimationFrame(e),particles.forEach((e=>{e.material=p})),scene.fog=new THREE.FogExp2(0,sceneSettings.current.fog),bloomComposer.render(),particles.forEach((e=>{e.material=m})),finalComposer.render()}()}startButton.addEventListener("click",init);