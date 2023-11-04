import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

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
  alpha: true
});
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight1.position.set(100, 100, 100);
// scene.add(directionalLight1);

// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight2.position.set(100, 100, -100);
// scene.add(directionalLight2);

// const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight3.position.set(-100, 100, 100);
// scene.add(directionalLight3);

// const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight4.position.set(-100, 100, -100);
// scene.add(directionalLight4);

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

// Axes
// let axes = new THREE.AxesHelper(10);
// scene.add(axes);

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
  miner_port,
  barrel,
  antminer;
let highlight_state = false, f_highlight_hx = false, f_highlight_starlink = false, f_highlight_miner = false, f_highlight_sensor = false, f_highlight_loop = false, f_highlight_campus = false;
const miner_group = new THREE.Group();
const starlink_group = new THREE.Group();
const loop_group = new THREE.Group();

// Bloom
const params = {
  threshold: 2,
  strength: 1,
  radius: 0.5,
  exposure: 2,
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth - 250, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const target = new THREE.WebGLRenderTarget(window.innerWidth - 250, window.innerHeight, {
  type: THREE.HalfFloatType,
  format: THREE.RGBAFormat,
});

const smaaPass = new SMAAPass((window.innerWidth - 250) * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
smaaPass.renderToScreen = true;
// smaaPass.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);
// smaaPass.edgeDetectionMaterial.setEdgeDetectionThresholdNormals(0.1);
// smaaPass.neighborhoodBlendingMaterial.setBlendMode(1); // AreaTex SMAA
// smaaPass.edgeDetectionMaterial.setTexelSize(1.0 / window.innerWidth, 1.0 / window.innerHeight);

const bloomComposer = new EffectComposer(renderer, target);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
// bloomComposer.addPass(smaaPass);

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
    if (child.name == "Barrel") barrel = child;
    if (child.name == "Miner_Port") miner_port = child;
    try {
      // child.material.transparent = true;
    } catch { }
  });
  scene.add(model);

  // WAP objects
  miner_group.add(switch_24port);
  miner_group.add(miner_port);
  scene.add(miner_group);

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
  scene.traverse((child) => {
    try {
      child.material.opacity = 0.5;
      if(child.name == "Container_Green") child.visible = false;
    } catch { }
  });
}

function transparent_back() {
  scene.traverse((child) => {
    try {
      child.material.opacity = 1;
      if(child.name == "Container_Green") child.visible = true;
    } catch { }
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
function highlight_miner() {
  f_highlight_miner = highlight(miner_group, f_highlight_miner, 20, "green", "miner");
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
document.getElementById("miner").addEventListener("click", highlight_miner);                // Highlight WAP
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
  bloomComposer.setSize(window.innerWidth - 250, window.innerHeight);
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
  // bloomComposer.render();

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
