import type { DataSource } from "./data_source.ts";

export enum BlendingMode {
  ALPHA_BLENDING,
  ADDITIVE_BLENDING,
  HALF_ADDITIVE_BLENDING,
}

export interface SpriteImageParams {
  path: string;
  name: string;
  extension: string;
  blendingMode?: BlendingMode;
  frameNumber?: number;
  isSwizzleMask: boolean;
  size?: number;
}

export class SpriteImage {
  public dataSource: DataSource;

  public path: string;
  public name: string;
  public extension: string;

  public blendingMode?: BlendingMode;
  public frameNumber?: number;
  public isSwizzleMask: boolean;
  public size?: number;

  constructor(
    dataSource: DataSource,
    { path, name, extension, blendingMode, frameNumber, isSwizzleMask, size }:
      SpriteImageParams,
  ) {
    this.dataSource = dataSource;

    this.path = path;
    this.name = name;
    this.blendingMode = blendingMode;
    this.frameNumber = frameNumber;
    this.isSwizzleMask = isSwizzleMask;
    this.size = size;
    this.extension = extension;
  }

  public get url(): string | undefined {
    if (!this.dataSource.pathToUrl) return undefined;

    return this.dataSource.pathToUrl(`${this.path}`);
  }
}
