import type { DataFile } from "./data_file.ts";

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
   * Whether or not the data source has been loaded.
   */
  loaded: boolean;

  /**
   * Loads data from the source.
   */
  loadData(): Promise<Map<string, DataFile>>;
}
