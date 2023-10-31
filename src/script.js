import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth - 250, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  (window.innerWidth - 250) / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-50, 40, 0);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;
orbitControls.maxDistance = 80;

// Lights
// const ambientLight = new THREE.AmbientLight(0xffffff, 2);
// scene.add(ambientLight);

// Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */
// Main Model
let model;
let starlink,
  wap,
  starlink_router,
  starlink_adapter,
  switch_24port,
  container_green,
  adapter_starlink,
  adapter_router,
  adapter_switch,
  wap_switch,
  loop,
  loop_pipe_hot,
  loop_pipe_cold,
  campus_loop,
  sensor,
  hx,
  antminer;
let highlight_state = false, f_highlight_hx = false, f_highlight_starlink = false, f_highlight_wap = false, f_highlight_sensor = false, f_highlight_loop = false, f_highlight_campus = false;
const wap_group = new THREE.Group();
const starlink_group = new THREE.Group();
const sensor_group = new THREE.Group();
const loop_group = new THREE.Group();

// Bloom
const params = {
  threshold: 3,
  strength: 2,
  radius: 1,
  exposure: 1,
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const target = new THREE.WebGLRenderTarget(1024, 1024, {
  type: THREE.HalfFloatType,
  format: THREE.RGBAFormat,
});

const bloomComposer = new EffectComposer(renderer, target);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

/**
 * Models
 */
// Load main model
gltfLoader.load("/models/main.glb", (gltf) => {
  model = gltf.scene;

  model.traverse((child) => {
    if (child.name == "Starlink") starlink = child;
    if (child.name == "WAP") wap = child;
    if (child.name == "Starlink_Router") starlink_router = child;
    if (child.name == "Starlink_Adapter") starlink_adapter = child;
    if (child.name == "Switch") switch_24port = child;
    if (child.name == "Container_Green") container_green = child;
    if (child.name == "Line_Adapter-Starlink") adapter_starlink = child;
    if (child.name == "Line_Adapter-Router") adapter_router = child;
    if (child.name == "Line_Adapter-Switch") adapter_switch = child;
    if (child.name == "Line_WAP_Switch") wap_switch = child;
    if (child.name == "Loop") loop = child;
    if (child.name == "Loop_Pipe_Hot") loop_pipe_hot = child;
    if (child.name == "Loop_Pipe_Cold") loop_pipe_cold = child;
    if (child.name == "Campus_Loop") campus_loop = child;
    if (child.name == "Antminer") antminer = child;
    if (child.name == "Sensor") sensor = child;
    if (child.name == "Heat_Exchanger") hx = child;
  });
  scene.add(model);

  // WAP objects
  wap_group.add(wap);
  wap_group.add(wap_switch);
  scene.add(wap_group);

  // Starlink Objects
  starlink_group.add(starlink);
  starlink_group.add(starlink_router);
  starlink_group.add(starlink_adapter);
  starlink_group.add(adapter_router);
  starlink_group.add(adapter_switch);
  starlink_group.add(adapter_starlink);
  scene.add(starlink_group);

  // Loop
  loop_group.add(loop);
  loop_group.add(loop_pipe_hot);
  loop_group.add(loop_pipe_cold);
  scene.add(loop_group);
});


/**
 * Functions
 */

function transparent_to() {
  model.traverse((child) => {
    if (child.isMesh == true) {
      child.material.transparent = true;
      child.material.opacity = 0.2;
    }
  });
}

function transparent_back() {
  model.traverse((child) => {
    if (child.isMesh == true) {
      child.material.opacity = 1;
    }
  });
}

function highlight(group, flag, intensity, color, id) {
  if (flag == false) {
    if (highlight_state == false) {
      transparent_to();
      group.traverse((child) => {
        if (child.isMesh == true) {
          child.material.emissive.set(color);
          child.material.emissiveIntensity = intensity;
        }
      });
      flag = true;
      highlight_state = true;
      document.getElementById(id).style.color = "#11ff11";
    }
  } else {
    transparent_back();
    group.traverse((child) => {
      if (child.isMesh == true) {
        child.material.emissive.set(new THREE.Color(0, 0, 0));
        child.material.emissiveIntensity = 1;
      }
    });
    flag = false;
    highlight_state = false;
    document.getElementById(id).style.color = "black";
  }
  return flag;
}

function highlight_starlink() {
  f_highlight_starlink = highlight(starlink_group, f_highlight_starlink, 20, "green", "starlink");
}
function highlight_wap() {
  f_highlight_wap = highlight(wap_group, f_highlight_wap, 20, "green", "wap");
}
function highlight_sensor() {
  f_highlight_sensor = highlight(sensor, f_highlight_sensor, 50, "green", "sensor");
}
function highlight_loop() {
  f_highlight_loop = highlight(loop_group, f_highlight_loop, 20, "green", "loop")
}
function highlight_campus() {
  f_highlight_campus = highlight(campus_loop, f_highlight_campus, 20, "green", "campus")
}

/**
 * Action
 */
document.getElementById("starlink").addEventListener("click", highlight_starlink);      // Highlight Starlink
document.getElementById("wap").addEventListener("click", highlight_wap);                // Highlight WAP
document.getElementById("sensor").addEventListener("click", highlight_sensor);          // Highlight Sensor
document.getElementById("loop").addEventListener("click", highlight_loop);              // Highlight Loop
document.getElementById("campus").addEventListener("click", highlight_campus);          // Highlight Loop

// Auto Resize
window.addEventListener("resize", () => {
  // Update camera
  camera.aspect = (window.innerWidth - 250) / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth - 250, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const animate = () => {
  // Update controls
  orbitControls.update();

  // Render Scene
  renderer.render(scene, camera);

  // Bloom
  bloomComposer.render();

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
