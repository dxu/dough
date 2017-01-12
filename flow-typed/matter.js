declare module "matter-js" {

  declare type BodyOptionsType = Object;
  declare type EngineOptionsType = Object;


  declare type World = {};
  declare type Grid = {};


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
    render(): void,
    timing: {
      timeScale: number,
      timestamp: number,
      velocityIterations: number,
    },
    world: World,
  }
}
