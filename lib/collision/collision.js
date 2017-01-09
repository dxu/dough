/* @flow */
import Vector2 from '../vector2';
// TODO: don't use this directly, refer to it from game so this is completely
//       separate
// import {Time} from '../constants/private';

import type Gob from '../gob';

import detectSAT from './narrow/detectors/SAT';
import resolveSAT from './narrow/resolvers/SAT';

import detectPredictiveSAT from './narrow/detectors/predictiveSAT';
import resolvePredictiveSAT from './narrow/resolvers/predictiveSAT';

function SAT(gob1: Gob, gob2: Gob): bool {
  const MTV: ?Vector2 = detectSAT(gob1, gob2);
  if (MTV == null) {
    return false;
  }

  resolveSAT(gob1, gob2, MTV);
  return true;
}


function predictiveSAT(gob1: Gob, gob2: Gob): bool {
  const [TFirst, normal]: [number, ?Vector2] = detectPredictiveSAT(gob1, gob2);
  // if it won't hit, or if it's already hitting, return false
  if (TFirst === Infinity || TFirst <= 0) {
    return false;
  }

  if (normal == null) {
    throw new Error(`Thought that there was a collision, but wasn't given a
      normal!`);
  }

  // otherwise
  resolvePredictiveSAT(gob1, gob2, TFirst, normal);
  return true;
}

export default function checkCollision(gob1: Gob, gob2: Gob): bool {
  // if both are immobile, use regular SAT, otherwise predictiveSAT
  const method: Function =
    gob1.velocity.isZero() && gob2.velocity.isZero() ?
    SAT :
    predictiveSAT;
  // if neither are circle, use either SAT or predictiveSAT

  // if one is a circle, one is a polygon, use special method
  // if both are circles, use special method

  return method(gob1, gob2);
}
