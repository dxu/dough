/* @flow */
import Gob from './gob';
import * as CONST from './constants/public';
import Pool from './pool';
import Vector2 from './vector2';
import Colliders from './colliders/entry';
import Matter from 'matter-js';
import MatterCollisions from 'matter-collision-events';

Matter.use('matter-collision-events');

window.Pew = {
  Colliders,
  Gob,
  CONST,
  Pool,
  Vector2,
  V2: Vector2,
};
