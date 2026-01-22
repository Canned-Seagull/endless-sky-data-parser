import type { DataFile } from "./data_file.ts";
import type { DataNode } from "./data_node.ts";
import type { DataSource } from "./data_source.ts";
import { Outfit } from "./outfit.ts";
import { Ship } from "./ship.ts";

// Object containing all the data in the game
export class GameData {
  public readonly outfits: Map<string, Outfit> = new Map<string, Outfit>();
  public readonly ships: Map<string, Ship> = new Map<string, Ship>();

  public dataSources: DataSource[] = [];

  /**
   * Returns whether at least one data source is loaded.
   */
  public get loaded(): boolean {
    return this.dataSources.length > 0;
  }

  /**
   * Loads all the data within the data files in a data source.
   * @param {DataSource} dataSource - Source of the data
   */
  public async loadDataSource(dataSource: DataSource): Promise<void> {
    this.dataSources.push(dataSource);

    const dataFiles = await dataSource.loadData();

    dataFiles.forEach((file) => this.loadDataFile(file));
  }

  public loadDataFile(dataFile: DataFile): void {
    const rootNode = dataFile.rootNode;

    // Load outfits first, as ships depend on them
    rootNode.children.filter(
      (childNode) => childNode.tokens[0].value === "outfit",
    )
      .forEach((childNode) => this.loadOutfitNode(childNode));

    // Load ships after outfits
    rootNode.children.filter(
      (childNode) => childNode.tokens[0].value === "ship",
    )
      .forEach((childNode) => this.loadShipNode(childNode));
  }

  private loadOutfitNode(node: DataNode): void {
    if (node.tokens.length < 2) throw new Error("Outfit node with no name");

    const outfitName = node.tokens[1].value;

    // If the outfit does not already exist, initialise an empty one
    if (!this.outfits.has(outfitName)) {
      this.outfits.set(outfitName, new Outfit(this));
    }

    this.outfits.get(outfitName)?.loadDataNode(node);
  }

  private loadShipNode(node: DataNode): void {
    if (node.tokens.length < 2) throw new Error("Ship node with no name");

    const shipName = node.tokens.length === 2
      ? node.tokens[1].value // Base ship
      : node.tokens[2].value; // Variant ship

    // If the ship does not already exist, initialise an empty one
    if (!this.ships.has(shipName)) {
      this.ships.set(shipName, new Ship(this));
    }

    this.ships.get(shipName)?.loadDataNode(node);
  }
}
