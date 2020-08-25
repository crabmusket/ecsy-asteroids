window.process = {env: {NODE_ENV: "debug"}};

import * as THREE from "https://unpkg.com/three@0.119.1?module";
import { World } from 'https://unpkg.com/ecsy@0.4.1?module';
import { Object3D, Collidable, Collider, Recovering, Moving, PulsatingScale, Timeout, PulsatingColor, Colliding, Rotating } from './components.js';
import { RotatingSystem, ColliderSystem, PulsatingColorSystem, PulsatingScaleSystem, MovingSystem,TimeoutSystem } from './systems.js';

const world = new World();

world
  .registerComponent(Object3D)
  .registerComponent(Collidable)
  .registerComponent(Collider)
  .registerComponent(Recovering)
  .registerComponent(Moving)
  .registerComponent(PulsatingScale)
  .registerComponent(Timeout)
  .registerComponent(PulsatingColor)
  .registerComponent(Colliding)
  .registerComponent(Rotating);

world
  .registerSystem(RotatingSystem)
  .registerSystem(PulsatingColorSystem)
  .registerSystem(PulsatingScaleSystem)
  .registerSystem(TimeoutSystem)
  .registerSystem(ColliderSystem)
  .registerSystem(MovingSystem);

main();

function randomSpherePoint(radius) {
  let u = Math.random();
  let v = Math.random();
  let theta = 2 * Math.PI * u;
  let phi = Math.acos(2 * v - 1);
  let x = radius * Math.sin(phi) * Math.cos(theta);
  let y = radius * Math.sin(phi) * Math.sin(theta);
  let z = radius * Math.cos(phi);
  return new THREE.Vector3(x,y,z);
}

function main() {
  let numObjects = 1000;
  let size = 0.2;
  let w = 100;

  const clock = new THREE.Clock();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.005, 10000 );
  camera.position.z = 20;

  const parent = new THREE.Object3D();

  let geometry = new THREE.IcosahedronGeometry( 1 );
  let material = new THREE.MeshStandardMaterial({color: '#ff0'});
  let parent2 = new THREE.Object3D();

  const objMoving = new THREE.Mesh( geometry, material );
  objMoving.position.set(0,0,0);
  let radius = 10;

  let entity = world.createEntity();
  objMoving.position.set(0,0,radius);
  entity.addComponent(Collider);
  entity.addComponent(Object3D, {object: objMoving});

  entity = world.createEntity();
  parent2.add(objMoving);
  entity.addComponent(Rotating, {rotatingSpeed: 0.5})
        .addComponent(Object3D, {object: parent2});
  parent.add(parent2);

  const states = [];

  let ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add( ambientLight );

  let directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

  let boxgeometry = new THREE.BoxBufferGeometry( size, size, size );

  for (let i = 0;i < numObjects; i++) {

    let material = new THREE.MeshStandardMaterial({color: new THREE.Color(1,0,0)});
    let mesh = new THREE.Mesh( boxgeometry, material );
    mesh.position.copy(randomSpherePoint(radius));

    let state = {
      mesh: mesh,
      colliding: false,
      rotationSpeed: 0,
      originalColor: material.color.clone(),
      tmpColor: new THREE.Color()
    };

    states.push(state);

    let entity = world.createEntity();
    entity.addComponent(Object3D, {object: mesh});
    entity.addComponent(PulsatingColor, {offset: i});
    entity.addComponent(PulsatingScale, {offset: i});

    if (Math.random() > 0.5) {
      entity.addComponent(Moving, {offset: i});
    }

    entity.addComponent(Collidable);
    parent.add( mesh );
  }

  scene.add( parent );

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x333333 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  //
  window.addEventListener( 'resize', onWindowResize, false );

  renderer.setAnimationLoop(animate);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  
  function animate() {
    let delta = clock.getDelta();
    let elapsedTime = clock.elapsedTime;
    //console.time('render');
    world.execute(delta, elapsedTime);
    //console.timeEnd('render');
  
    renderer.render( scene, camera );
  }
}