import * as THREE from 'https://unpkg.com/three@0.119.1?module';
import { System } from 'https://unpkg.com/ecsy@0.4.1?module';
import * as components from './components.js';
import { Pinput } from './pinput.js';

export class SpinningAsteroids extends System {
  static get queries() {
    return {
      entities: {components: [components.Asteroid, components.Object3D]},
    };
  }

  execute(delta) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let object = entity.getComponent(components.Object3D).object;
      let {x, y, z} = entity.getComponent(components.Asteroid);

      object.rotation.x += x * delta;
      object.rotation.y += y * delta * 2;
      object.rotation.z += z * delta * 3;
    }
  }
}

const FORWARDS = new THREE.Vector3(0, 0, -1);
const RIGHT = new THREE.Vector3(1, 0, 0);

export class PlayerMovement extends System {
  static get queries() {
    return {
      entities: {components: [components.Player, components.Object3D]},
    };
  }

  input = new Pinput();

  // These are to avoid allocation during updates. Completely unnecessary, but
  // maybe good practise for more important systems :)
  forwards = new THREE.Vector3();
  right = new THREE.Vector3();
  drag = new THREE.Vector3();
  angDrag = new THREE.Vector3();

  execute(delta) {
    this.input.update();

    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let object = entity.getComponent(components.Object3D).object;
      let player = entity.getMutableComponent(components.Player);
      this.updateRotation(object, player, delta);
      this.updatePosition(object, player, delta);
    }
  }

  updateRotation(object, player, delta) {
    this.angDrag.copy(player.angularVelocity).clampLength(0, player.angularDrag);
    if (this.input.isDown('arrowleft')) {
      player.angularVelocity.y += delta * player.rotAcceleration;
    }
    if (this.input.isDown('arrowright')) {
      player.angularVelocity.y -= delta * player.rotAcceleration;
    }
    if (this.input.isDown('arrowup')) {
      player.angularVelocity.x -= delta * player.rotAcceleration;
    }
    if (this.input.isDown('arrowdown')) {
      player.angularVelocity.x += delta * player.rotAcceleration;
    }
    if (this.input.isDown('e')) {
      player.angularVelocity.z -= delta * player.rotAcceleration * 0.5;
    }
    if (this.input.isDown('q')) {
      player.angularVelocity.z += delta * player.rotAcceleration * 0.5;
    }
    player.angularVelocity.addScaledVector(this.angDrag, delta * -1);
    player.angularVelocity.clampLength(0, player.rotSpeedLimit);
    object.rotateX(delta * player.angularVelocity.x);
    object.rotateY(delta * player.angularVelocity.y);
    object.rotateZ(delta * player.angularVelocity.z);
  }

  updatePosition(object, player, delta) {
    this.forwards.copy(FORWARDS).transformDirection(object.matrixWorld);
    this.right.copy(RIGHT).transformDirection(object.matrixWorld);
    this.drag.copy(player.velocity).clampLength(0, player.drag);
    if (this.input.isDown('w')) {
      player.velocity.addScaledVector(this.forwards, delta * player.acceleration);
    }
    if (this.input.isDown('a')) {
      player.velocity.addScaledVector(this.right, delta * -player.acceleration);
    }
    if (this.input.isDown('s')) {
      player.velocity.addScaledVector(this.forwards, delta * -player.acceleration);
    }
    if (this.input.isDown('d')) {
      player.velocity.addScaledVector(this.right, delta * player.acceleration);
    }
    player.velocity.addScaledVector(this.drag, delta * -1);
    player.velocity.clampLength(0, player.speedLimit);
    object.position.addScaledVector(player.velocity, delta);
  }
}

// ---------------------------------------------------------------------------

class RotatingSystem extends System {
  static get queries() {
    return {
      entities: { components: [Rotating, Object3D] },
    };
  }

  execute(delta) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let rotatingSpeed = entity.getComponent(Rotating).rotatingSpeed;
      let object = entity.getComponent(Object3D).object;

      object.rotation.x += rotatingSpeed * delta;
      object.rotation.y += rotatingSpeed * delta * 2;
      object.rotation.z += rotatingSpeed * delta * 3;
    }
  }
}

const TIMER_TIME = 1;

class PulsatingColorSystem extends System {
  static get queries() {
    return {
      entities: { components: [PulsatingColor, Object3D] },
    };
  }

  execute(delta, time) {
    time *= 1000;
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let object = entity.getComponent(Object3D).object;
      if (entity.hasComponent(Colliding)) {
        object.material.color.setRGB(1, 1, 0);
      } else if (entity.hasComponent(Recovering)) {
        let col = 0.3 + entity.getComponent(Timeout).timer / TIMER_TIME;
        object.material.color.setRGB(col, col, 0);
      } else {
        let r =
          Math.sin(
            time / 500 + entity.getComponent(PulsatingColor).offset * 12
          ) /
            2 +
          0.5;
        object.material.color.setRGB(r, 0, 0);
      }
    }
  }
}

class PulsatingScaleSystem extends System {
  static get queries() {
    return {
      entities: { components: [PulsatingScale] },
    };
  }

  execute(delta, time) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let object = entity.getComponent(Object3D).object;

      let mul;
      if (entity.hasComponent(Colliding)) {
        mul = 2;
      } else if (entity.hasComponent(Recovering)) {
        mul = 1.2;
      } else {
        mul = 0.8;
      }

      let offset = entity.getComponent(PulsatingScale).offset;
      let sca = mul * (Math.cos(time + offset) / 2 + 1) + 0.2;
      object.scale.set(sca, sca, sca);
    }
  }
}

class MovingSystem extends System {
  static get queries() {
    return {
      entities: { components: [Moving] },
    };
  }

  execute(delta, time) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let object = entity.getComponent(Object3D).object;
      let offset = entity.getComponent(Moving).offset;
      let radius = 5;
      let maxRadius = 5;
      object.position.z = Math.cos(time + 3 * offset) * maxRadius + radius;
    }
  }
}

class TimeoutSystem extends System {
  static get queries() {
    return {
      entities: { components: [Timeout] },
    };
  }

  execute(delta) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];

      let timeout = entity.getMutableComponent(Timeout);
      timeout.timer -= delta;
      if (timeout.timer < 0) {
        timeout.timer = 0;
        timeout.addComponents.forEach(componentName => {
          entity.addComponent(componentName);
        });
        timeout.removeComponents.forEach(componentName => {
          entity.removeComponent(componentName);
        });

        entity.removeComponent(Timeout);
      }
    }
  }
}

let ballWorldPos = new THREE.Vector3();

class ColliderSystem extends System {
  static get queries() {
    return {
      boxes: { components: [Collidable] },
      balls: { components: [Collider] },
    };
  }

  execute() {
    let boxes = this.queries.boxes.results;
    let balls = this.queries.balls.results;
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i];
      let ballObject = ball.getComponent(Object3D).object;
      ballObject.getWorldPosition(ballWorldPos);
      if (!ballObject.geometry.boundingSphere) {
        ballObject.geometry.computeBoundingSphere();
      }
      let radiusBall = ballObject.geometry.boundingSphere.radius;

      for (let j = 0; j < boxes.length; j++) {
        let box = boxes[j];
        let boxObject = box.getComponent(Object3D).object;
        let prevColliding = box.hasComponent(Colliding);
        if (!boxObject.geometry.boundingSphere) {
          boxObject.geometry.computeBoundingSphere();
        }
        let radiusBox = boxObject.geometry.boundingSphere.radius;
        let radiusSum = radiusBox + radiusBall;

        if (
          boxObject.position.distanceToSquared(ballWorldPos) <=
          radiusSum * radiusSum
        ) {
          if (!prevColliding) {
            box.addComponent(Colliding);
          }
        } else {
          if (prevColliding) {
            box.removeComponent(Colliding);
            box.addComponent(Recovering);
            box.addComponent(Timeout, {
              timer: TIMER_TIME,
              removeComponents: [Recovering]
            });
          }
        }
      }
    }
  }
}
