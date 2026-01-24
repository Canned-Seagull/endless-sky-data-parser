import type { DataSource } from "./data_source.ts";

export class Sprite {
  public name: string;

  private path: string;
  private dataSource: DataSource;

  constructor(name: string, path: string, dataSource: DataSource) {
    this.name = name;
    this.path = path;
    this.dataSource = dataSource;
  }

  public get url(): string | undefined {
    if (!this.dataSource.pathToUrl) return undefined;

    return this.dataSource.pathToUrl(`${this.path}`);
  }
}
