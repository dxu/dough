/* @flow */
import Gob from './gob';
import * as CONST from './constants/public';
import Game from './game';
import Vector2 from './vector2';
import Colliders from './colliders/entry';
import Scene from './scene';
import Keyboard from './keyboard';
import RigidBody from './rigidbody';

window.Pew = {
  RigidBody,
  Colliders,
  Gob,
  CONST,
  Game,
  Keyboard,
  Scene,
  Vector2,
  V2: Vector2,
};
