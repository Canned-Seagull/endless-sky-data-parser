import type { DataFile } from "./data_file.ts";
import type { Sprite } from "./sprite.ts";

/**
 * A source containing a collection of data files.
 */
export interface DataSource {
  /**
   * A human-readable name of the data source.
   */
  name: string;

  /**
   * Data files in a source.
   */
  dataFiles: Map<string, DataFile>;

  /**
   * Sprites in a source.
   */
  sprites: Map<string, Sprite>;

  /**
   * Whether or not the data source has been loaded.
   */
  loaded: boolean;

  /**
   * Loads the source.
   */
  load(): Promise<void>;

  /**
   * Converts a path within a data source to a URL from which the resource at the path can be loaded.
   *
   * @param {string} path - Path of the resource within the data source without the leading slash
   */
  pathToUrl?(path: string): string;
}
