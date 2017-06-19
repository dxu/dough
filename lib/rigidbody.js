import Gob from './gob';
import invariant from 'invariant';
import Vector2 from './vector2';
import Matter from 'matter-js';
import {Time} from './constants/private';

type GobRigidBodyProps = {
  mass: number,
  friction: number,
  frictionStatic: number,
  frictionAir: number,
  restitution: number,
  velocity: Vector2,
  angularVelocity: number,
  maxVelocity: Vector2,
  maxAngularVelocity: number,
};

const RIGIDBODY_DEFAULTS = {
  mass: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  restitution: 0,
  angularVelocity: 0,
  isStatic: false,
};

//
export default class RigidBody {
  gob: Gob;
  mass: number;
  isStatic: bool;
  collider: BoxCollider;

  constructor({
    mass = 1,
    isStatic = false,
    collider,
    rotatable = false,
    friction = 1,
    frictionAir = 0.00,
    frictionStatic = 1,
    density = 0.001,
  }) {
    this.density = density;
    this.friction = friction;
    this.frictionAir = frictionAir;
    this.frictionStatic = frictionStatic;
    this.mass = mass;
    this.isStatic = isStatic;
    this.collider = collider;
    invariant(this.collider, 'RigidBody must be provided a collider');
    this.collider.rigidbody = this;
  }

  __init(world: Matter.World, gob: Gob) {
    this.gob = gob;
    this.collider.__init(world, gob);
    // update ability to rotate
    if (!this.rotatable) {
      Matter.Body.setInertia(this.collider.body, Infinity);
    }

    Matter.Body.set(this.collider.body, {
      friction: this.friction,
      frictionAir: this.frictionAir,
      frictionStatic: this.frictionStatic,
      density: this.density,
    });

    this.collider.body.onCollide(pair => {
      this.gob.onCollide(pair);
    });

    this.collider.body.onCollideEnd(pair => {
      this.gob.onCollideEnd(pair);
    });

    this.collider.body.onCollideActive(pair => {
      this.gob.onCollideActive(pair);
    });
  }

  // TODO: clenaup
  destroy() {}

  getVelocity(): Vector2 {
    return {
      x: this.collider.body.velocity.x,
      y: this.collider.body.velocity.y,
    };
  }

  setVelocity(
    x: number = this.collider.body.velocity.x / Time.dts,
    y: number = this.collider.body.velocity.y / Time.dts,
  ) {
    Matter.Body.setVelocity(
      this.collider.body,
      Matter.Vector.create(x * Time.dts, y * Time.dts),
    );
  }

  setVelocityY(y: number = this.collider.body.velocity.y) {
    Matter.Body.setVelocity(this.collider.body, {
      x: this.collider.body.velocity.x,
      y,
    });
  }
}
