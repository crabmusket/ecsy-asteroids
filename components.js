import { TagComponent, Component, Types } from "./ecsy/src/index.js";

export class Collidable extends TagComponent {}
export class Collider extends TagComponent {}
export class Recovering extends TagComponent {}
export class Moving extends TagComponent {}

export class PulsatingScale extends Component {
  static get schema() {
    return {
      offset: { type: Types.Number, default: 0 },
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

export class Timeout extends Component {
  static get schema() {
    return {
      timer: { type: Types.Number },
      addComponents: { type: Types.Array },
      removeComponents: { type: Types.Array },
    };
  }
}

export class PulsatingColor extends Component {
  static get schema() {
    return {
      offset: { type: Types.Number },
    };
  }
}

export class Colliding extends Component {
  static get schema() {
    return {
      value: { type: Types.Boolean },
    };
  }
}

export class Rotating extends Component {
  static get schema() {
    return {
      enabled: { type: Types.Boolean },
      rotatingSpeed: { type: Types.Number },
      decreasingSpeed: { type: Types.Number, default: 0.001 },
    };
  }
}
