import Vector2 from '../vector2'

// https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
// See section on "moving objects"

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

function checkMovingProjectionOverlap(vertices1, vertices2, vector, MTV) {


//   // no overlap
//   if (min1 > max2 || max1 < min2) {
//     return null
//   } else {
//     // the magnitude of the overlap
//     let newMTVMagnitude = Math.min(max2 - min1, max1 - min2)
//     let vectorMag = vector.mag()
//     // if the magnitude is smaller than the magnitude of the current mtv then we should update
//     // the mtv with the new values
//     if (newMTVMagnitude < MTV.mag()) {
//       MTV.x = vector.x * newMTVMagnitude / vectorMag
//       MTV.y = vector.y * newMTVMagnitude / vectorMag
//     }
//     return MTV
//   }

}

export function movingSAT(gob1, gob2) {
  // get the absolute vertices
  let vertices1 = gob1.getPreviousAbsoluteVertices()
  let vertices2 = gob2.getPreviousAbsoluteVertices()

  // velocity
  const velocity = Vector2.Subtract(gob2.velocity, gob1.velocity)

  // gather the normals
  let normals1 = gob1.getNormals()
  let normals2 = gob2.getNormals()

  let MTV = new Vector2(-Infinity, -Infinity)

  // we are calculating in terms of a single timestep
  let TMax = 1
  let TFirst = 0
  let TLast = Infinity

  // if there has been a collision, calculate how far it's gone
  let TElapsed = 0
  // least amount of time
  // let TMin = Infinity
  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end
  for (let i=0; i<normals1.length; i++) {
    // projection speed
    // const speed = Vector2.Dot(normals1[i], velocity) / normals1[i].mag() / normals1[i].mag()
    const speed = Vector2.Dot(normals1[i], velocity) / normals1[i].mag() / normals1[i].mag()
    let T
    TFirst = 0
    TLast = Infinity


    let min0 = Infinity
    let max0 = -Infinity
    let min1 = Infinity
    let max1 = -Infinity

    vertices1.map(function(vertex) {
      let val = Vector2.ProjectScalar(vertex, normals1[i])
      min0 = Math.min(min0, val)
      max0 = Math.max(max0, val)
    })

    vertices2.map(function(vertex) {
      let val = Vector2.ProjectScalar(vertex, normals1[i])
      min1 = Math.min(min1, val)
      max1 = Math.max(max1, val)
    })

    if (max1 < min0) {
        // console.log('here1')
      if (speed <= 0) {
        return false
      }
      T = (min0 - max1) / speed
      if (T > TFirst) {
        TFirst = T
      }
      if (TFirst > TMax) {
        return false
      }
      T = (max0 - min1) / speed
      if (T < TLast) {
        TLast = T
      }
      if (TFirst > TLast) {
        return false
      }
    } else if (max0 < min1) {
        // console.log('here2')
      if (speed >= 0) {
        return false
      }
      T = (max0 - min1) / speed
      if (T > TFirst) {
        TFirst = T
      }
      if (TFirst > TMax) {
        return false
      }
      T = (min0 - max1) / speed
      if (T < TLast) {
        TLast = T
      }
      if (TFirst > TLast) {
        return false
      }
    } else {
      // set TElapsed
      // the minimum of the two possible overlaps, to determine the actual overlap
      TElapsed = Math.min(Math.abs(max0 - min1), Math.abs(max1 - min0)) / speed
        // console.log('here3')
      if (speed > 0) {
        T = (max0 - min1) / speed
        if (T < TLast) {
          TLast = T
        }
        if (TFirst > TLast) {
          return false
        }
      } else if (speed < 0) {
        T = (min0 - max1) / speed
        if (T < TLast) {
          TLast = T
        }
        if (TFirst > TLast) {
          return false
        }
      }
    }
    // console.log('t', TFirst, speed)

    // TMin = Math.min(T, TMin)
  }
  console.log('colliding', TFirst, TLast, TElapsed)

  // SHIT! We can't do this here. there's no way to figure out how far
  // something has already intersected and signal that??? I guess we have to
  // or maybe we don't actually need to do that. we can always just assume that
  // we will never intersect further? need to test. maybe we can always
  // revert the position back to something that is not exactly zero away? need
  // to test - if you extrude to exactly zero, at the next timestep, it will
  // update their position to inside the other object, which will mean we'll
  // need to find the opposite
  //
  //
  //
  // collided! we limit the gob resolution to this method, to preserve modularity
  console.log(gob1.velocity, gob1.position)
  gob1.position.x -= gob1.velocity.x * (TFirst)
  gob1.position.y -= gob1.velocity.y * (TFirst)
  // gob1.updatePosition(this.velocity.x * Time.dts, this.velocity.y * Time.dts)

  return true

  // for (let i=0; i<normals2.length; i++) {
  //   MTV = checkMovingProjectionOverlap(vertices1, vertices2, normals2[i], MTV)
  //   if (MTV == null) {
  //     return null
  //   }
  // }

}

export function resolveMovingCollision(gob1, gob2) {
}


/* resolve the collision. */
export function resolveCollision(gob1, gob2, MTV) {
  // first project gob1 and gob2 out of the MTV by determining the proportion of VELOCITY
  let v1m = gob1.velocity.mag()
  let v2m = gob2.velocity.mag()

  let totalVelocity = v1m + v2m


  let p1 = v1m / (v1m + v2m)
  let p2 = v2m / (v2m + v1m)

  console.log('hit this')


  // ONLY USE THE MTV FOR OBJECTS THAT AREN'T MOVING.
  if (gob1.velocity.isZero() && gob2.velocity.isZero()) {
    let [left, right] = gob1.position.x >= gob2.position.x ? [gob2, gob1] : [gob1, gob2]
    let [top, bottom] = gob1.position.y >= gob2.position.y ? [gob2, gob1] : [gob1, gob2]

    // TODO: BROKEN
    right.position.x += MTV.x
    bottom.position.y -= MTV.y

    // left.position.x -= MTV.x
    // top.position.y -= MTV.y
  }
  // if one or more are moving, we project in the exact opposite directions they're moving in
  else {
    // projection vector is -velocity
    const projection1 = -gob1.velocity
    const projection2 = -gob2.velocity
    // calculate the overlap, projected onto each

  }

  // readjust the positions
    // gob1.position.x += (gob1.velocity.x < 0 ? 1 : -1) * p1 * MTV.x
    // gob1.position.y += (gob1.velocity.y < 0 ? -1 : 1) * p1 * MTV.y

    // gob2.position.x += (gob2.velocity.x < 0 ? 1 : -1) * p2 * MTV.x
    // gob2.position.y += (gob2.velocity.y < 0 ? -1 : 1) * p2 * MTV.y

  // conserve momentum
  // let v1 = gob1.velocity

}

