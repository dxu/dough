import Vector2 from '../vector2'

// return true if projection oerlaps
function checkProjectionOverlap(vertices1, vertices2, vector) {
  let min1 = Infinity
  let max1 = -Infinity
  let min2 = Infinity
  let max2 = -Infinity
  vertices1.map(function(vertex) {
    let val = Vector2.ProjectScalar(vertex, vector)
    min1 = Math.min(min1, val)
    max1 = Math.max(max1, val)
  })

  vertices2.map(function(vertex) {
    let val = Vector2.ProjectScalar(vertex, vector)
    min2 = Math.min(min2, val)
    max2 = Math.max(max2, val)
  })

  return min1 > max2 || max1 < min2
}

// TODO: for now it assumes both gobs are convex
export function SAT(gob1, gob2) {
  // get the absolute vertices
  let vertices1 = gob1.getAbsoluteVertices()
  let vertices2 = gob2.getAbsoluteVertices()

  // gather the normals
  let normals1 = gob1.getNormals()
  let normals2 = gob2.getNormals()

  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end
  for (let i=0; i<normals1.length; i++) {
    if (checkProjectionOverlap(vertices1, vertices2, normals1[i])) {
      return false
    }
  }

  for (let i=0; i<normals2.length; i++) {
    if (checkProjectionOverlap(vertices1, vertices2, normals2[i])) {
      return false
    }
  }


  // http://www.metanetsoftware.com/technique/tutorialA.html
  // it's intersecting, so we need to calculate the shortest projection vector, and then adjust. We should adjust the velocities, and the positions, according to mass proportions.
  //
  //
  // after getting shortest projection vector, get the normal, get the perpendicular
  //
  //


  return true
}

