import type { DataSource } from "./data_source.ts";

export interface SpriteImageParams {
  path: string;
  name: string;
  extension: string;
  blendingMode?: string;
  frameNumber?: string;
  swizzleMaskFlag?: string;
  size?: string;
}

export class SpriteImage {
  public dataSource: DataSource;

  public path: string;
  public name: string;
  public extension: string;

  public blendingMode?: string;
  public frameNumber?: string;
  public swizzleMaskFlag?: string;
  public size?: string;

  constructor(
    dataSource: DataSource,
    { path, name, extension, blendingMode, frameNumber, swizzleMaskFlag, size }:
      SpriteImageParams,
  ) {
    this.dataSource = dataSource;

    this.path = path;
    this.name = name;
    this.blendingMode = blendingMode;
    this.frameNumber = frameNumber;
    this.swizzleMaskFlag = swizzleMaskFlag;
    this.size = size;
    this.extension = extension;
  }

  public get url(): string | undefined {
    if (!this.dataSource.pathToUrl) return undefined;

    return this.dataSource.pathToUrl(`${this.path}`);
  }
}
