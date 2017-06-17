/* @flow */
import Matter from 'matter-js';
import type Vector2 from '../vector2';
import type Gob from '../gob';

// implements Collider interface
export default class PolygonCollider {
  body: Matter.Body;
  // clockwise order
  vertices: Array<Vector2>;
  height: number;
  // vertices: Array<Matter.Vector>;
  constructor(gob: Gob, vertices: Array2<Vector2>) {
    this.vertices = vertices;
    // Note that velocity and angularVelocity are read-only! they need to be
    // initialized by gob
    this.body = Matter.Body.create({
      angle: gob.transform.angle,
      position: Matter.Vector.create(
        gob.transform.position.x,
        gob.transform.position.y,
      ),
      vertices: vertices.map(vertex => Matter.Vector.create(vertex.x, vertex.y))
    });
  }
}
