import type { DataSource } from "./data_source.ts";

export class Sprite {
  public name: string;

  private dataSource: DataSource;

  constructor(name: string, dataSource: DataSource) {
    this.name = name;
    this.dataSource = dataSource;
  }

  public get url(): string | undefined {
    if (!this.dataSource.pathToUrl) return undefined;

    return this.dataSource.pathToUrl(`images/${this.name}`);
  }
}
