/* @flow */
import Gob from './gob';
import * as CONST from './constants/public';
import Pool from './pool';
import Vector2 from './vector2';
import Collider from './colliders/entry';

window.Pew = {
  Collider,
  Gob,
  CONST,
  Pool,
  Vector2,
  V2: Vector2,
};
