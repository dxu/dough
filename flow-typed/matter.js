declare module "matter-js" {

  declare type BodyOptionsType = Object;
  declare type EngineOptionsType = Object;
  declare type CompositeOptionsType = {
    bodies: Array<Body>,
    composites: Array<Composite>,
    constraints: Array<Constraint>,
    id: number,
    isModified: bool,
    label: String,
    parent: Composite,
    type: String,
  };

  declare type Body = {};
  declare type World = {};
  declare type Grid = {};
  declare type Constraint = {};
  declare type Vector = {};
  declare type Render = {};

  declare class Composite {
    static add(composite: Composite, object: Object): Composite;
    static allBodies(composite: Composite): Array<Body>;
    static allConstraints(composite: Composite): Array<Constraint>;
    static clear(composite: Composite, keepStatic: bool, deep?: bool): Composite;
    static create(options?: CompositeOptionsType): Composite;
    static get(composite: Composite, id: number, type: number): Object;
    static move(compositeA: Composite, objects: Array<Object>, compositeB: Composite): Composite;
    static rebase(composite: Composite): Composite;
    static remove(composite: Composite, object: Object, deep?: bool): Composite;
    static rotate(composite: Composite, rotation: number, point: Vector, recursive?: bool): void;
    static scale(composite: Composite, scaleX: number, scaleY: number, point: Vector, recursive?: bool): void;
    static setModified(composite: Composite, isModified: bool, updateParents?: bool, updateChildren?: bool): void;
    static translate(composite: Composite, translation: Vector, recursive: bool): void;
    // CompositeOptionsType
    bodies: Array<Body>,
    composites: Array<Composite>,
    constraints: Array<Constraint>,
    id: number,
    isModified: bool,
    label: String,
    parent: Composite,
    type: String,
  }

  declare class Engine {
    static clear(engine: Engine): void;
    static create(options?: EngineOptionsType): Engine;
    static merge(engineA: Engine, engineB: Engine): void;
    static run(engine: Engine): void;
    // delta defaults to 16.666, correction defaults to 1
    static update(engine: Engine, delta: number, correction: number): void;

    broadphase: Grid,
    constraintIterations: number,
    enableSleeping: bool,
    positionIterations: number,
    // DEPRECATED!
    render: Render,
    timing: {
      timeScale: number,
      timestamp: number,
      velocityIterations: number,
    },
    world: World,
  }
}
