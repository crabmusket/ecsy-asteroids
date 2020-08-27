import { TagComponent, Component, Types } from 'https://unpkg.com/ecsy@0.4.1?module';

export class Asteroid extends Component {
  static get schema() {
    return {
      x: {type: Types.Number},
      y: {type: Types.Number},
      z: {type: Types.Number},
    };
  }
}

export class Object3D extends Component {
  static get schema() {
    return {
      object: { type: Types.Ref },
    };
  }
}

export class Player extends Component {
  static get schema() {
    return {
      acceleration: {type: Types.Number},
      drag: {type: Types.Number},
      angularDrag: {type: Types.Number},
      speedLimit: {type: Types.Number}, // metres/second
      rotAcceleration: {type: Types.Number},
      rotSpeedLimit: {type: Types.Number}, // radians/second
      velocity: {type: Types.Ref},
      angularVelocity: {type: Types.Ref},
    };
  }
}

// ---------------------------------------------------------------------------

class Collidable extends TagComponent {}
class Collider extends TagComponent {}
class Recovering extends TagComponent {}
class Moving extends TagComponent {}

class PulsatingScale extends Component {
  static get schema() {
    return {
      offset: { type: Types.Number, default: 0 },
    };
  }
}

class Timeout extends Component {
  static get schema() {
    return {
      timer: { type: Types.Number },
      addComponents: { type: Types.Array },
      removeComponents: { type: Types.Array },
    };
  }
}

class PulsatingColor extends Component {
  static get schema() {
    return {
      offset: { type: Types.Number },
    };
  }
}

class Colliding extends Component {
  static get schema() {
    return {
      value: { type: Types.Boolean },
    };
  }
}

class Rotating extends Component {
  static get schema() {
    return {
      enabled: { type: Types.Boolean },
      rotatingSpeed: { type: Types.Number },
      decreasingSpeed: { type: Types.Number, default: 0.001 },
    };
  }
}
