import Vector2 from '../vector2'

// if it overlaps, return the projection vector
function checkProjectionOverlap(vertices1, vertices2, vector, MTV) {
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

  // no overlap
  if (min1 > max2 || max1 < min2) {
    return null
  } else {
    // the magnitude of the overlap
    let newMTVMagnitude = Math.min(max2 - min1, max1 - min2)
    let vectorMag = vector.mag()
    // if the magnitude is smaller than the magnitude of the current mtv then we should update
    // the mtv with the new values
    if (newMTVMagnitude < MTV.mag()) {
      MTV.x = vector.x * newMTVMagnitude / vectorMag
      MTV.y = vector.y * newMTVMagnitude / vectorMag
    }
    return MTV
  }
}

// TODO: for now it assumes both gobs are convex
// returns null if no collision, otherwise returns MTV
export function SAT(gob1, gob2) {
  // get the absolute vertices
  let vertices1 = gob1.getAbsoluteVertices()
  let vertices2 = gob2.getAbsoluteVertices()

  // gather the normals
  let normals1 = gob1.getNormals()
  let normals2 = gob2.getNormals()

  let MTV = new Vector2(-Infinity, -Infinity)

  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end
  for (let i=0; i<normals1.length; i++) {
    MTV = checkProjectionOverlap(vertices1, vertices2, normals1[i], MTV)
    if (MTV == null) {
      return null
    }
  }

  for (let i=0; i<normals2.length; i++) {
    MTV = checkProjectionOverlap(vertices1, vertices2, normals2[i], MTV)
    if (MTV == null) {
      return null
    }
  }
  console.log('x: ', MTV.x, 'y: ', MTV.y)


  // http://www.metanetsoftware.com/technique/tutorialA.html
  // it's intersecting, so we need to calculate the shortest projection vector, and then adjust. We should adjust the velocities, and the positions, according to mass proportions.
  //
  //
  // after getting shortest projection vector, get the normal, get the perpendicular
  //
  //


  return MTV
}

/* resolve the collision. */
export function resolveCollision(gob1, gob2, MTV) {
  // first project gob1 and gob2 out of the MTV by determining the proportion of VELOCITY
  let v1m = gob1.velocity.mag()
  let v2m = gob2.velocity.mag()

  let totalVelocity = v1m + v2m


  let p1 = v1m / (v1m + v2m)
  let p2 = v2m / (v2m + v1m)

  // readjust the positions
  gob1.position.x += (gob1.velocity.x < 0 ? 1 : -1) * p1 * MTV.x
  gob1.position.y += (gob1.velocity.y < 0 ? -1 : 1) * p1 * MTV.y

  gob2.position.x += (gob2.velocity.x < 0 ? 1 : -1) * p2 * MTV.x
  gob2.position.y += (gob2.velocity.y < 0 ? -1 : 1) * p2 * MTV.y


  // conserve momentum
  // let v1 = gob1.velocity

}

