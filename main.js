window.process = {env: {NODE_ENV: "debug"}};

import * as THREE from 'https://unpkg.com/three@0.119.1?module';
import * as Ecsy from 'https://unpkg.com/ecsy@0.4.1?module';
import * as components from './components.js';
import * as systems from './systems.js';
import { Gyroscope } from './gyroscope.js';

const world = new Ecsy.World();

world
  .registerComponent(components.Object3D)
  .registerComponent(components.Asteroid)
  .registerComponent(components.Player)

world
  .registerSystem(systems.SpinningAsteroids)
  .registerSystem(systems.PlayerMovement)

main();

function main() {
  const numAsteroids = 1000;
  const size = 0.2;
  const w = 100;

  const clock = new THREE.Clock();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.add(makeMap());
  scene.add(camera);
  let player = world.createEntity();
  player.addComponent(components.Object3D, {object: camera});
  player.addComponent(components.Player, {
    acceleration: 50,
    drag: 4,
    speedLimit: 20,
    rotAcceleration: 4,
    rotSpeedLimit: 8,
    angularDrag: 2,
    velocity: new THREE.Vector3(),
    angularVelocity: new THREE.Vector3(),
  });

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
    entity.addComponent(components.Object3D, {object: asteroid});
    entity.addComponent(components.Asteroid, randomAngularSpeeds());

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

  function randomAngularSpeeds() {
    return {
      x: (Math.random() - 0.5) * 0.2,
      y: (Math.random() - 0.5) * 0.2,
      z: (Math.random() - 0.5) * 0.2,
    };
  }

  function makeMap() {
    let geometry = new THREE.EdgesGeometry(new THREE.CircleGeometry(0.3, 32));
    let material = new THREE.LineBasicMaterial({color: 0xffff00});
    let outline = new THREE.LineSegments(geometry, material);
    let isoc = new THREE.IcosahedronGeometry(0.015);
    let isocMat = new THREE.MeshBasicMaterial({color: 0xffff00});
    let pointer = new THREE.Mesh(isoc, isocMat);
    pointer.position.set(0, -0.3, 0);
    outline.add(pointer);
    outline.rotation.set(Math.PI/2, 0, 0);
    let gyro = new Gyroscope();
    gyro.add(outline);
    let group = new THREE.Group();
    group.position.set(0, -0.25, -1);
    group.add(gyro);
    return group;
  }
}
