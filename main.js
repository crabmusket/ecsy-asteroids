window.process = {env: {NODE_ENV: "debug"}};

import * as THREE from "https://unpkg.com/three@0.119.1?module";
import { World } from 'https://unpkg.com/ecsy@0.4.1?module';
import { Object3D, Collidable, Collider, Recovering, Moving, PulsatingScale, Timeout, PulsatingColor, Colliding, Rotating } from './components.js';
import { RotatingSystem, ColliderSystem, PulsatingColorSystem, PulsatingScaleSystem, MovingSystem,TimeoutSystem } from './systems.js';

var world = new World();

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

var camera, scene, renderer, parent;
var clock = new THREE.Clock();

init();

function randomSpherePoint(radius) {
  var u = Math.random();
  var v = Math.random();
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  var x = radius * Math.sin(phi) * Math.cos(theta);
  var y = radius * Math.sin(phi) * Math.sin(theta);
  var z = radius * Math.cos(phi);
  return new THREE.Vector3(x,y,z);
}

var objMoving, states;
function init() {
  var numObjects = 1000;
  var size = 0.2;
  var w = 100;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.005, 10000 );
  camera.position.z = 20;

  parent = new THREE.Object3D();


  var geometry = new THREE.IcosahedronGeometry( 1 );
  var material = new THREE.MeshStandardMaterial({color: '#ff0'});
  var parent2 = new THREE.Object3D();

  objMoving = new THREE.Mesh( geometry, material );
  objMoving.position.set(0,0,0);
  var radius = 10;

  var entity = world.createEntity();
  objMoving.position.set(0,0,radius);
  entity.addComponent(Collider);
  entity.addComponent(Object3D, {object: objMoving});

  entity = world.createEntity();
  parent2.add(objMoving);
  entity.addComponent(Rotating, {rotatingSpeed: 0.5})
        .addComponent(Object3D, {object: parent2});
  parent.add(parent2);

  states = [];

  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

  var geometry = new THREE.BoxBufferGeometry( size, size, size );

  for (var i = 0;i < numObjects; i++) {

    var material = new THREE.MeshStandardMaterial({color: new THREE.Color(1,0,0)});
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.copy(randomSpherePoint(radius));

    var state = {
      mesh: mesh,
      colliding: false,
      rotationSpeed: 0,
      originalColor: material.color.clone(),
      tmpColor: new THREE.Color()
    };

    states.push(state);

    var entity = world.createEntity();
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

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x333333 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  //
  window.addEventListener( 'resize', onWindowResize, false );

  renderer.setAnimationLoop(animate);

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  var delta = clock.getDelta();
  var elapsedTime = clock.elapsedTime;
  //console.time('render');
  world.execute(delta, elapsedTime);
  //console.timeEnd('render');

  renderer.render( scene, camera );
}