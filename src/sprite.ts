import type { DataSource } from "./data_source.ts";
import type { SpriteImageParams } from "./sprite_image.ts";
import { SpriteImage } from "./sprite_image.ts";

export class Sprite {
  public name: string;

  public frames: SpriteImage[] = [];

  constructor(name: string) {
    this.name = name;
  }

  /**
   * The most representative image of this sprite.
   * If the sprite is animated, returns the first frame.
   * If the sprite has multiple sizes, returns the image with the original size.
   *
   * For convenience only, has no in-game significance.
   */
  public get mainImage(): SpriteImage {
    const frame = this.frames.find((frame) =>
      // First frame
      (!frame.frameNumber || Number(frame.frameNumber) === 0) &&
      // Original size
      (!frame.size || frame.size === 1)
    );

    if (!frame) {
      throw new Error(`Could not find main image for sprite: ${this.name}`);
    }

    return frame;
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
