/* @flow */
import Gob from './gob';
import * as CONST from './constants/public';
import Game from './game';
import Tilemap from './tilemap';
import Vector2 from './vector2';
import Colliders from './colliders/entry';
import Scene from './scene';
import Keyboard from './keyboard';
import RigidBody from './rigidbody';
import Matter from 'matter-js';
import MatterCollisions from 'matter-collision-events';

Matter.use('matter-collision-events');

window.Dough = {
  Matter,
  RigidBody,
  Colliders,
  Gob,
  CONST,
  Game,
  Keyboard,
  Scene,
  Tilemap,
  Vector2,
  V2: Vector2,
};
