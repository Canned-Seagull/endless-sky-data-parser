import { DataFile } from "./data_file.ts";

/**
 * A source containing a collection of data files.
 */
export interface DataSource {
  /**
   * Returns a human-readable name of the data source.
   */
  getName(): string;

  /**
   * Loads data from the source.
   */
  loadData(): Promise<Map<string, DataFile>>;
}
