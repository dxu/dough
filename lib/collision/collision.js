import Vector2 from '../vector2'
// TODO: don't use this directly, refer to it from game so this is completely separate
import {Time} from '../constants/private'

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
  let vertices1 = gob1.getAABB()
  let vertices2 = gob2.getAABB()

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
  // console.log('x: ', MTV.x, 'y: ', MTV.y)


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

// given a set of vertices, an index, get best edge
// function getBestEdge(vertices, index, normal) {
//   let vl = vertices[(vertices.length + index - 1) % vertices.length]
//   let v = vertices[(vertices.length + index) % vertices.length]
//   let vr = vertices[(vertices.length + index + 1) % vertices.length]

//   let vectorL = Vector2.Subtract(v, vl)
//   let vectorR = Vector2.Subtract(v, vr)
//   if (
//     Vector2.ProjectScalar(vectorL, normal) <=
//     Vector2.ProjectScalar(vectorR, normal)
//   ) {
//     return [vl, v]
//   } else {
//     return [v, vr]
//   }
// }

// http://www.dyn4j.org/2011/11/contact-points-using-clipping/
// THIS WILL JUST RETURN THE EDGE FOR WHICH THIS SET OF VERTICeS IS
// INTERSECTING. Used for determing the velocity
function getBestEdge(vertices, normal) {
  let max = -Infinity
  let index = 0
  for (let i=0; i<vertices.length; i++) {
    const projection = Vector2.ProjectScalar(vertices[i], normal)
    if (projection > max) {
      max = projection
      index = i
    }
  }


  let vl = vertices[(vertices.length + index - 1) % vertices.length]
  let v = vertices[(vertices.length + index) % vertices.length]
  let vr = vertices[(vertices.length + index + 1) % vertices.length]

  let vectorL = Vector2.Subtract(v, vl)
  let vectorR = Vector2.Subtract(v, vr)
  if (
    Vector2.ProjectScalar(vectorL, normal) <=
    Vector2.ProjectScalar(vectorR, normal)
  ) {
    return [vl, v]
  } else {
    return [v, vr]
  }
}

// adjust velocity based on the average of the friction and bounciness
function adjustVelocity(surface, gob, surfaceGob) {
  // first get the normal to the surface vector
  let normal = surface.orthol()
  // project velocity onto both normal and surface vectors to get each
  // component
  let surfaceComponent = Vector2.ProjectVector(gob._velocity, surface)
  let normalComponent = Vector2.ProjectVector(gob._velocity, normal)

  // Friction is determined by surface
  // multiple by coefficient of friction
  const friction = surfaceGob.friction

  // bounce is determined purely by gob
  const bounce = gob.bounce

  surfaceComponent.multiply(friction)
  // TODO: implement conservation of momentum
  // mimics "conservation of momentum"
  // if the general direction of both velocities are the same, multiply by
  // 1 + bounce. If not, multiply by (1 - bounce).
  //

  // TODO: How to implement conservation of momentum? there will be two
  // collision resolutions
  let xMult
  if (Math.sign(gob._velocity.x) !== Math.sign(surfaceGob._velocity.x)) {
    // if they are going in opposite directions, always bounce away
    xMult = -1
  } else if (Math.abs(gob._velocity.x) > Math.abs(surfaceGob._velocity.x)) {
    // if this object caught up to the surface, always bounce away.
    xMult = -1
  }
  // shouldn't be able to have a collisino where one catches up to the other
  // and they're both moving at the same speed
    else {
    // otherwise another object caught up to this one
    xMult = 1
  }

  let yMult
  if (Math.sign(gob._velocity.y) !== Math.sign(surfaceGob._velocity.y)) {
    // if they are going in opposite directions, always bounce away
    yMult = -1
  } else if (Math.abs(gob._velocity.y) > Math.abs(surfaceGob._velocity.y)) {
    // if this object caught up to the surface, always bounce away.
    yMult = -1
  }
  // shouldn't be able to have a collisino where one catches up to the other
  // and they're both moving at the same speed
    else {
    // otherwise another object caught up to this one
    yMult = 1
  }

  // if (Math.sign(gob._velocity.x) !== Math.sign(surfaceGob._velocity.x)) {

  // }

  // let xMult = Math.sign(gob._velocity.x) === Math.sign(surfaceGob._velocity.x) ? 1 : -1
  // let yMult = Math.sign(gob._velocity.y) === Math.sign(surfaceGob._velocity.y) ? 1 : -1

  normalComponent.multiply(
    (bounce * xMult),
    (bounce * yMult),
  )

  return surfaceComponent.add(normalComponent.x, normalComponent.y)
}

// use conservation of momentum/energy to adjust velocity
// given:
// v1 = final velocity of first object
// v2 = final velocity of second object
// u1 = initial velocity of first object
// u2 = initial velocity of second object
// m1 = mass of first object
// m2 = mass of second object
// c = coefficiant of restitution
//
//
// v1 = (c * m2 * (u2 - u1) + m1 * u1 + m2 * u2) / (m1 + m2)
// v2 = (c * m1 * (u1 - u2) + m1 * u1 + m2 * u2) / (m1 + m2)
//
//
//
function adjustPhysicsVelocity(gob1, gob2) {
  const u1x = gob1.velocity.x
  const u2x = gob2.velocity.x
  const u1y = gob1.velocity.y
  const u2y = gob2.velocity.y
  const m1 = gob1.mass
  const m2 = gob2.mass

  const r1 = 1
  const r2 = 1

  updateCollisionVelocity(gob1, gob2, r1, r2)

//   gob1.velocity.x = getCollisionVelocity(u1x, u2x, m1, m2, c1)
//   gob2.velocity.x = getCollisionVelocity(u2x, u1x, m2, m1, c2)

//   gob1.velocity.y = getCollisionVelocity(u1y, u2y, m1, m2, c1)
//   gob2.velocity.y = getCollisionVelocity(u2y, u1y, m2, m1, c2)
}

// more to read: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
//
// c1x = center 1 x
// c1y = center 1 y
// c2x = center 2 x
// c2y = center 2 y
//
// v1x = u1x - 2m2 / (m1 + m2) * Vector2.Dot(v1-v2, c1-c2) * (c1x - c2x)
// v1x = u1x - 2m2 / (m1 + m2) * Vector2.Dot(v1-v2, c1-c2) * (c1x - c2x)
function updateCollisionVelocity(gob1, gob2, r1, r2) {
  const u1 = gob1.velocity
  const u2 = gob2.velocity
  const m1 = gob1.mass
  const m2 = gob2.mass

  let velocities1 = Vector2.Subtract(gob1.velocity, gob2.velocity)
  let centers1 = Vector2.Subtract(gob1.position, gob2.position)

  let velocities2 = Vector2.Subtract(gob2.velocity, gob1.velocity)
  let centers2 = Vector2.Subtract(gob2.position, gob1.position)

  let temp = new Vector2(0, 0)
  let temp2 = new Vector2(0, 0)

  let dot1 = Vector2.Dot(velocities1, centers1)
  let dot2 = Vector2.Dot(velocities2, centers2)

  temp.x = r1 * (u1.x - 2 * m2 / (m1 + m2) * dot1 / centers1.mag() / centers1.mag() * centers1.x)
  temp.y = r1 * (u1.y - 2 * m2 / (m1 + m2) * dot1 / centers1.mag() / centers1.mag() * centers1.y)

  temp2.x = r2 * (u2.x - 2 * m1 / (m1 + m2) * dot2 / centers2.mag() / centers2.mag() * centers2.x)
  temp2.y = r2 * (u2.y - 2 * m1 / (m1 + m2) * dot2 / centers2.mag() / centers2.mag() * centers2.y)

  gob1.velocity.x = temp.x
  gob1.velocity.y = temp.y

  gob2.velocity.x = temp2.x
  gob2.velocity.y = temp2.y
}

function getBrokenCollisionVelocity(u1, u2, m1, m2, c) {
  return (c * m2 * (u2 - u1) + m1 * u1 + m2 * u2) / (m1 + m2)
}

// https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
export function movingSAT(gob1, gob2) {
  // console.log('in movingSat', gob1._position.x, gob1._previousPosition.x)
  // get the absolute vertices
  let vertices1 = gob1.getAABB()
  let vertices2 = gob2.getAABB()

  // velocity
  const velocity = Vector2.Subtract(gob2._velocity, gob1._velocity)
  // account for DTS
  // velocity.x /= Time.dts
  // velocity.y /= Time.dts

  // gather the normals
  let normals = gob1.getNormals().concat(gob2.getNormals())

  let MTV = new Vector2(-Infinity, -Infinity)

  // we are calculating in terms of a single timestep
  let TMax = Time.dts
  let TFirst = 0
  let TLast = Infinity

  let Length = 0

  // if there has been a collision, calculate how far it's gone
  let TElapsed = 0
  let edge1
  let edge2
  let normal

  // least amount of time
  // let TMin = Infinity
  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end
  for (let i=0; i<normals.length; i++) {
    // projection speed
    // const speed = Vector2.Dot(normals[i], velocity) / normals[i].mag() / normals[i].mag()
    // console.log(Vector2.Dot(normals[i], velocity))
    // const speed = Vector2.Dot(normals[i], velocity) / normals[i].mag() / normals[i].mag()

    // speed is the projection of the speed onto the normal
    const speed = Vector2.ProjectScalar(velocity, normals[i])
    let T
    // TFirst = 0
    // TLast = Infinity


    let min0 = Infinity
    let max0 = -Infinity
    let min1 = Infinity
    let max1 = -Infinity

    let min0Index = Infinity
    let max0Index = -Infinity
    let min1Index = Infinity
    let max1Index = -Infinity

    // get max and min of collision
    vertices1.map(function(vertex, index) {
      let val = Vector2.ProjectScalar(vertex, normals[i])
      min0 = Math.min(min0, val)
      if (val > max0) {
        max0 = val
        max0Index = index
      }
    })

    vertices2.map(function(vertex, index) {
      let val = Vector2.ProjectScalar(vertex, normals[i])
      min1 = Math.min(min1, val)
      if (val > max1) {
        max1 = val
        max1Index = index
      }
    })

    if (max1 < min0) {
        // console.log('here1')
      if (speed <= 0) {
        return false
      }
      T = (min0 - max1) / speed
      if (T > TFirst) {
        TFirst = T
        Length = min0 - max1
        edge1 = getBestEdge(vertices1, Vector2.Negative(normals[i]))
        edge2 = getBestEdge(vertices2, normals[i])
        normal = normals[i]
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
        Length = max0 - min1
        edge1 = getBestEdge(vertices1, normals[i])
        edge2 = getBestEdge(vertices2, Vector2.Negative(normals[i]))
        normal = normals[i]
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

    // set TElapsed
    // the minimum of the two possible overlaps, to determine the actual overlap
    if (speed !== 0) {
      TElapsed = Math.min(Math.abs(max0 - min1), Math.abs(max1 - min0)) / Math.abs(speed)
    }
    // console.log('t', TFirst, speed, TElapsed)
    // TMin = Math.min(T, TMin)
    // return true
  }

  // console.log('colliding')
  // console.log('colliding', TFirst, TLast, TElapsed, Length)

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
  // console.log(gob1._velocity, gob1._position)
  // console.log('inside here', TFirst, gob2._previousPosition.y, gob2._position.y, gob2._velocity.y)
  // console.log('inside here', TFirst, gob1._previousPosition.y, gob1._position.y, gob1._velocity.y)
  if (TFirst !== 0) {
    // it's going to collide with this next move. in this case, we need to
    // adjust so it doesn't overshoot.

    // we set it to be at TFirst - 0.0001 so that there isn't going to be an overlap
    gob1.position.y = gob1._position.y + gob1._velocity.y  * (TFirst - 0.0001)
    gob1.position.x = gob1._position.x + gob1._velocity.x  * (TFirst - 0.0001)

    gob2.position.y = gob2._position.y + gob2._velocity.y  * (TFirst - 0.0001)
    gob2.position.x = gob2._position.x + gob2._velocity.x  * (TFirst - 0.0001)

    adjustPhysicsVelocity(gob1, gob2)
    // there will be a leftover of (Time.dts - (TFirst - 0.0001)) of new velocity for each
    // gob1.position.y = gob1._position.y + gob1.velocity.y  * (Time.dts - (TFirst - 0.0001))
    // gob1.position.x = gob1._position.x + gob1.velocity.x  * (Time.dts - (TFirst - 0.0001))

    // gob2.position.y = gob2._position.y + gob2.velocity.y  * (Time.dts - (TFirst - 0.0001))
    // gob2.position.x = gob2._position.x + gob2.velocity.x  * (Time.dts - (TFirst - 0.0001))



    // we need to find the collision surface. Then we need to project the velocity vectors onto the collision surface, adjust the parallel and perpendicular components to the


    // we need to then find the minimum of the two (absolute value), and add back (Time.dts - (TFirst - 0.0001)) * minVelocity movement to both to account for the lost movement.
    // if (Math.abs(gob1._velocity.x) <= Math.abs(gob2._velocity.x)) {
    //   gob1._position.x += gob1._velocity.x * (Time.dts - (TFirst - 0.0001))
    //   gob2._position.x += gob1._velocity.x * (Time.dts - (TFirst - 0.0001))
    // } else {
    //   gob1._position.x += gob2._velocity.x * (Time.dts - (TFirst - 0.0001))
    //   gob2._position.x += gob2._velocity.x * (Time.dts - (TFirst - 0.0001))
    // }
    // if (Math.abs(gob1._velocity.y) <= Math.abs(gob2._velocity.y)) {
    //   gob1._position.y += gob1._velocity.y * (Time.dts - (TFirst - 0.0001))
    //   gob2._position.y += gob1._velocity.y * (Time.dts - (TFirst - 0.0001))
    // } else {
    //   gob1._position.y += gob2._velocity.y * (Time.dts - (TFirst - 0.0001))
    //   gob2._position.y += gob2._velocity.y * (Time.dts - (TFirst - 0.0001))
    // }




    // TODO: allow calling a callback defined by this module in the collision engine to make sure velocity isn't lost

    // clipping
    let e1 = Vector2.Subtract(edge1[1], edge1[0])
    let e2 = Vector2.Subtract(edge2[1], edge2[0])
    // for the velocity, project the velocity onto the edge

// console.log('adjusting')
    // we mark the velocities to change next cycle, because we don't want them
    // affecting
    // gob1.velocity = adjustVelocity(e2, gob1, gob2)
    // gob2.velocity = adjustVelocity(e1, gob2, gob1)

  }

  // gob1._position.y -=
  // gob1.updatePosition(this._velocity.x * Time.dts, this._velocity.y * Time.dts)

  // console.log('after movingSat', gob1._position.y, gob1._previousPosition.y)
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
  let v1m = gob1._velocity.mag()
  let v2m = gob2._velocity.mag()

  let totalVelocity = v1m + v2m


  let p1 = v1m / (v1m + v2m)
  let p2 = v2m / (v2m + v1m)

  // console.log('hit this')


  // ONLY USE THE MTV FOR OBJECTS THAT AREN'T MOVING.
  if (gob1._velocity.isZero() && gob2._velocity.isZero()) {
    let [left, right] = gob1._position.x >= gob2._position.x ? [gob2, gob1] : [gob1, gob2]
    let [top, bottom] = gob1._position.y >= gob2._position.y ? [gob2, gob1] : [gob1, gob2]

    // TODO: BROKEN
    right._position.x += MTV.x
    bottom._position.y -= MTV.y

    // left._position.x -= MTV.x
    // top._position.y -= MTV.y
  }
  // if one or more are moving, we project in the exact opposite directions they're moving in
  else {
    // projection vector is -velocity
    const projection1 = -gob1._velocity
    const projection2 = -gob2._velocity
    // calculate the overlap, projected onto each

  }

  // readjust the positions
    // gob1._position.x += (gob1._velocity.x < 0 ? 1 : -1) * p1 * MTV.x
    // gob1._position.y += (gob1._velocity.y < 0 ? -1 : 1) * p1 * MTV.y

    // gob2._position.x += (gob2._velocity.x < 0 ? 1 : -1) * p2 * MTV.x
    // gob2._position.y += (gob2._velocity.y < 0 ? -1 : 1) * p2 * MTV.y

  // conserve momentum
  // let v1 = gob1._velocity

}

