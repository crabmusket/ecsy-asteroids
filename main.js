window.process = {env: {NODE_ENV: "debug"}};

import * as THREE from "./three.js";
import * as Ecsy from './ecsy/src/index.js';
import * as components from './components.js';

const world = new Ecsy.World();

world
  .registerComponent(components.Object3D)
  .registerComponent(components.Asteroid)

main();

function main() {
  const numAsteroids = 1000;
  const size = 0.2;
  const w = 100;

  const clock = new THREE.Clock();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.005, 10000);

  const root = new THREE.Object3D();

  let asteroidGeometry = new THREE.IcosahedronGeometry(1);
  let asteroidMaterial = new THREE.MeshPhongMaterial({color: '#ffa', flatShading: true});

  let ambientLight = new THREE.AmbientLight(0x111111);
  scene.add(ambientLight);

  let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 0).normalize();
  scene.add(directionalLight);

  for (let i = 0; i < numAsteroids; i += 1) {
    let asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    randomisePosition(asteroid.position, w);

    let entity = world.createEntity();
    entity.addComponent(Object3D, {object: asteroid});

    root.add(asteroid);
  }

  scene.add(root);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setClearColor(0x080808);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);

  renderer.setAnimationLoop(animate);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    let delta = clock.getDelta();
    let elapsedTime = clock.elapsedTime;
    world.execute(delta, elapsedTime);
    renderer.render(scene, camera);
  }

  function randomisePosition(pos, w) {
    pos.set(
      w * (Math.random() * 2 - 1),
      w * (Math.random() * 2 - 1),
      w * (Math.random() * 2 - 1)
    );
  }
}
