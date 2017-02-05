/* @flow */

import type Gob from './gob';
import type GobOptions from './gob';
import Vector2 from './vector2';

let count: number = 0;

// TODO: create a type out of the id
export const Utils = {
  uuid(): number {
    return count++;
    // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    //     return v.toString(16);
    // });
  }
}


export const GobUtils = {
  // calculateRelativeVertices(width: number, height: number): Array<Vector2> {
  //   // 2D AABB consists of a position, and a width and height
  //   return [
  //     new Vector2(-width / 2, -height / 2),
  //     new Vector2(width / 2, -height / 2),
  //     new Vector2(width / 2, height / 2),
  //     new Vector2(-width / 2, height / 2),
  //   ];
  // },
  // calculateWidthAndHeight(
  //   relativeVertices: Array<Vector2>
  // ): {width: number, height: number} {
  //   // 2D AABB consists of a position, and a width and height
  //   let minX = -Infinity;
  //   let maxX = Infinity;
  //   let minY = -Infinity;
  //   let maxY = Infinity;
  //   relativeVertices.map(function(vertex) {
  //     minX = Math.min(vertex.x, minX);
  //     maxX = Math.min(vertex.x, maxX);
  //     minY = Math.min(vertex.y, minY);
  //     maxY = Math.min(vertex.y, maxY);
  //   })
  //   return {
  //     width: maxX - minX,
  //     height: maxY - minY,
  //   }
  // },
  // updateDerived(gob: Gob) {
  //   gob.relativeVertices.map(
  //     (vertex: Vector2): Vector2 => vertex.rotate(gob.angle),
  //   );

  //   // if there is a width and height, and isn't rotating/rotated then use AABB
  //   if (
  //     gob.width && gob.height &&
  //     gob.angularVelocity === 0 && gob.angle === 0
  //   ) {
  //     gob.vertices = gob._aabb =
  //       GobUtils.calculateAABB(gob.position, gob.width, gob.height);
  //     return;
  //   }
  //   // otherwise, update absolute vertices, and
  //   gob.vertices = gob.relativeVertices.map((vertex: Vector2): Vector2 => {
  //     return Vector2.Sum(vertex, gob.position);
  //   });
  //   gob._aabb = GobUtils.calculateAABBFromVertices(gob.vertices);

  //   // update the normals
  //   gob._edges = gob.vertices.map((
  //     vertex: Vector2,
  //     index: number,
  //   ): Vector2 => {
  //     return Vector2.Difference(
  //       gob.vertices[(index + 1) % gob.vertices.length], vertex,
  //     );
  //   });

  //   gob._normals = gob._edges.map((vertex: Vector2): Vector2 => {
  //     return vertex.orthol();
  //   });
  // },

  // // update the vertices relative to center. Will update AABB together with the
  // // vertices
  // calculateAABB(position: Vector2, width: number, height: number): Array<Vector2> {
  //   // the AABB. Goes from TL, clockwise
  //   const aabb: Array<Vector2> = [
  //     new Vector2(0, 0), // TL
  //     new Vector2(0, 0), // TR
  //     new Vector2(0, 0), // BR
  //     new Vector2(0, 0), // BL
  //   ];

  //   // TL, BL
  //   aabb[0].x = aabb[3].x = position.x - width / 2;
  //   // TR, BR
  //   aabb[1].x = aabb[2].x = position.x + width / 2;

  //   // TL, BL
  //   aabb[0].y = aabb[1].y = position.y - height / 2;
  //   // TR, BR
  //   aabb[2].y = aabb[3].y = position.y + height / 2;

  //   return aabb;
  // },

  // calculateAABBFromVertices(vertices: Array<Vector2>): Array<Vector2> {
  //   let minX: number = 0;
  //   let minY: number = 0;
  //   let maxX: number = 0;
  //   let maxY: number = 0;
  //   // go through vertices
  //   vertices.map((vertex: Vector2): void => {
  //     minX = Math.min(minX, vertex.x);
  //     minY = Math.min(minX, vertex.y);
  //     maxX = Math.max(minX, vertex.x);
  //     maxY = Math.max(minX, vertex.y);
  //   });
  //   // the AABB. Goes from TL, clockwise
  //   const aabb: Array<Vector2> = [
  //     new Vector2(minY, minX), // TL
  //     new Vector2(minY, maxX), // TR
  //     new Vector2(maxY, minX), // BR
  //     new Vector2(maxY, maxX), // BL
  //   ];
  //   return aabb;
  // }
}

