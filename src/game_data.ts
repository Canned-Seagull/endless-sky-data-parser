import { DataFile } from "./data_file.ts";
import { DataNode } from "./data_node.ts";
import { DataSource } from "./data_source.ts";
import { warnAtDataFileLine } from "./error.ts";
import { Outfit } from "./outfit.ts";
import { Ship } from "./ship.ts";

// Object containing all the data in the game
export class GameData {
  readonly outfits = new Map<string, Outfit>();
  readonly ships = new Map<string, Ship>();

  readonly sources: DataSource[] = [];

  /**
   * Loads all the data within the data files in a data source.
   * @param {DataSource} dataSource - Source of the data
   */
  async loadDataSource(dataSource: DataSource): Promise<void> {
    const dataFiles = await dataSource.loadData();

    dataFiles.forEach((file) => this.loadDataFile(file));
  }

  loadDataFile(dataFile: DataFile): void {
    const rootNode = dataFile.rootNode;

    for (const childNode of rootNode.children) {
      const nodeName = childNode.tokens[0].value;

      switch (nodeName) {
        case "outfit":
          this.loadOutfitNode(childNode);
          break;
        case "ship":
          this.loadShipNode(childNode);
          break;
        default:
          warnAtDataFileLine(
            dataFile,
            childNode.tokens[0].line,
            "Unsupported node",
          );
      }
    }
  }

  private loadOutfitNode(node: DataNode): void {
    const outfit = new Outfit(this, node);
    this.outfits.set(outfit.name, outfit);
  }

  private loadShipNode(node: DataNode): void {
    const ship = new Ship(this, node);
    this.ships.set(ship.name, ship);
  }
}
