/* @flow */
import Matter from 'matter-js';
import type Gob from '../gob';

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
  // vertices: Array<Matter.Vector>;
  constructor(gob: Gob, width: number, height: number) {
    this.width = width;
    this.height = height;
    // create the collider from the width + height
    // Note that velocity and angularVelocity are read-only! they need to be
    // initialized by gob
    this.body = Matter.Body.create({
      angle: gob.transform.angle,
      position: Matter.Vector.create(
        gob.transform.position.x,
        gob.transform.position.y,
      ),
      vertices: [
        // TL
        Matter.Vector.create(
          gob.transform.position.x - this.width / 2,
          gob.transform.position.y - this.height / 2,
        ),
        // TR
        Matter.Vector.create(
          gob.transform.position.x + this.width / 2,
          gob.transform.position.y - this.height / 2,
        ),
        // BR
        Matter.Vector.create(
          gob.transform.position.x + this.width / 2,
          gob.transform.position.y + this.height / 2,
        ),
        // BL
        Matter.Vector.create(
          gob.transform.position.x - this.width / 2,
          gob.transform.position.y + this.height / 2,
        ),
      ],
    });
  }
}
