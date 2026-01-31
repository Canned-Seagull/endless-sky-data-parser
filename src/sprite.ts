import type { DataSource } from "./data_source.ts";
import type { SpriteImageParams } from "./sprite_image.ts";
import { SpriteImage } from "./sprite_image.ts";

export class Sprite {
  public name: string;

  public frames: SpriteImage[] = [];

  constructor(name: string) {
    this.name = name;
  }

  public addFrame(
    dataSource: DataSource,
    imageParams: SpriteImageParams,
  ): void {
    this.frames.push(
      new SpriteImage(
        dataSource,
        imageParams,
      ),
    );
  }
}
