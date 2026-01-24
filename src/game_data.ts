import type { DataFile } from "./data_file.ts";
import type { DataNode } from "./data_node.ts";
import type { DataSource } from "./data_source.ts";
import { Outfit } from "./outfit.ts";
import { Ship } from "./ship.ts";
import type { Sprite } from "./sprite.ts";

// Object containing all the data in the game
export class GameData {
  public readonly outfits: Map<string, Outfit> = new Map<string, Outfit>();
  public readonly ships: Map<string, Ship> = new Map<string, Ship>();
  public readonly sprites: Map<string, Sprite> = new Map<string, Sprite>();

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

    await dataSource.load();

    dataSource.sprites.forEach((sprite, name) =>
      this.sprites.set(name, sprite)
    );
    dataSource.dataFiles.forEach((file) => this.loadDataFileOutfits(file));
    dataSource.dataFiles.forEach((file) => this.loadDataFileBaseShips(file));
    dataSource.dataFiles.forEach((file) => this.loadDataFileVariantShips(file));
  }

  public loadDataFile(dataFile: DataFile): void {
    // Load outfits first, as ships depend on them
    this.loadDataFileOutfits(dataFile);
    // Load ships after outfits
    this.loadDataFileBaseShips(dataFile);
    // Then, variants that must depend on base ships
    this.loadDataFileVariantShips(dataFile);
  }

  private loadDataFileOutfits(dataFile: DataFile): void {
    dataFile.rootNode.children.filter(
      (childNode) => childNode.tokens[0].value === "outfit",
    )
      .forEach((childNode) => this.loadOutfitNode(childNode));
  }

  private loadDataFileBaseShips(dataFile: DataFile): void {
    dataFile.rootNode.children.filter(
      (childNode) =>
        childNode.tokens[0].value === "ship" && childNode.tokens.length === 2,
    )
      .forEach((childNode) => this.loadShipNode(childNode));
  }

  private loadDataFileVariantShips(dataFile: DataFile): void {
    dataFile.rootNode.children.filter(
      (childNode) =>
        childNode.tokens[0].value === "ship" && childNode.tokens.length >= 3,
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
