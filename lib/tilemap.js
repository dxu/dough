import {Utils} from './util';
import Gobi from './gobi';
import type from './scene';

type GobTransformProps = {
  position: Vector2,
  scale: Vector2,
  angle: number,
};

export default class Tilemap extends Gobi {
  _pixi: Pixi.Sprite;
  tilemapStore: {
    // TODO: add tiled tilemap object keys
    [name: string]: Object,
  };
  // the name of the tilemap this is associated with
  name: string;
  scene: Scene;

  static load(tileObj) {}

  static __load(loader: Loader, tilemapObj: string) {
    console.log(tilemapObj);
    // tilemapObj.layers.map(Utils.convertTileMapLayer)
    // grab the images of the tilesets and load them with pixi
    tilemapObj.tilesets.map(tileset => {
      console.log(
        'jjlkkkkjk',
        Utils.getPixiResourceKey(Tilemap.name, tileset.name),
      );
      loader.loadTilemap(
        Utils.getPixiResourceKey(Tilemap.name, tileset.name),
        tileset.image,
      );
    });
  }

  constructor(name) {
    super();
    this.name = name;
  }

  __init(scene: Scene, opts: GobOptions) {
    this.scene = scene;
    super.__init(scene, opts);
    const resource =
      scene.resources[Utils.getPixiResourceKey(Tilemap.name, this.name)];
    console.log(
      scene.resources,
      Tilemap.name,
      Utils.getPixiResourceKey(Tilemap.name, this.name),
    );
    this._pixi = PIXI.Sprite.from(resource.texture);
    console.log(this._pixi, scene.stage);
  }

  __onSceneLoad() {
    console.log(this._pixi);
    // this.scene.stage.addChild(this._pixi);

    // parse the tilemap, and then
    // texture = new PIXI.Texture(loader.resources["tileset"].texture, new PIXI.Rectangle(tx, ty, tw, th));
  }
}
