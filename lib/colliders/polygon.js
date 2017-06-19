/* @flow */
import Matter from 'matter-js';
import type Vector2 from '../vector2';
import type Gob from '../gob';

// implements Collider interface
export default class PolygonCollider {
  body: Matter.Body;
  // clockwise order
  vertices: Array<Vector2>;
  constructor(vertices: Array2<Vector2>) {
    this.vertices = vertices;
  }

  __init(world: Matter.World, gob: Gob) {
    this.gob = gob;

    this.body = Matter.Body.create({
      angle: this.gob.transform.angle,
      position: Matter.Vector.create(
        this.gob.transform.position.x,
        this.gob.transform.position.y,
      ),
      vertices: this.vertices.map(vertex => Matter.Vector.create(vertex.x, vertex.y))
    });
  }
}
