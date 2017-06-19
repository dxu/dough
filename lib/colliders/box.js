/* @flow */
import type Gob from '../gob';
import Game from '../game';
import Matter from 'matter-js';
import Vector2 from '../vector2';
import type RigidBody from '../rigidbody';

type BoxColliderProps = {
  body: Matter.Body,
  width: number,
  height: number,
  // vertices: Array<Matter.Vector>,
  // TODO: only used for polygon
  // relativeVertices: Array<Vector2>,
  // _edges: Array<Vector2>,
  // _normals: Array<Vector2>,
  // _aabb: Array<Vector2>,
};

// implements Collider interface
export default class BoxCollider {
  body: Matter.Body;
  width: number;
  height: number;
  shape: Matter.Shape;
  gob: Gob;
  rigidbody: RigidBody;

  // vertices: Array<Matter.Vector>;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  __init(world: Matter.World, gob: Gob) {
    this.gob = gob;

    this.body = Matter.Body.create({
      angle: this.gob.transform.angle,
      position: Matter.Vector.create(
        this.gob.transform.position.x,
        this.gob.transform.position.y,
      ),
      vertices: [
        // TL
        Matter.Vector.create(
          this.gob.transform.position.x - this.width / 2,
          this.gob.transform.position.y - this.height / 2,
        ),
        // TR
        Matter.Vector.create(
          this.gob.transform.position.x + this.width / 2,
          this.gob.transform.position.y - this.height / 2,
        ),
        // BR
        Matter.Vector.create(
          this.gob.transform.position.x + this.width / 2,
          this.gob.transform.position.y + this.height / 2,
        ),
        // BL
        Matter.Vector.create(
          this.gob.transform.position.x - this.width / 2,
          this.gob.transform.position.y + this.height / 2,
        ),
      ],
    });
  }
}
