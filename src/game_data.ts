import { DataNode } from "./data_node.ts";
import { warnAtLine } from "./error.ts";
import { Outfit } from "./outfit.ts";
import { Ship } from "./ship.ts";

// Object containing all the data in the game
export class GameData {
  readonly outfits = new Map<string, Outfit>();
  readonly ships = new Map<string, Ship>();

  loadRootNode(rootNode: DataNode): void {
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
          warnAtLine(childNode.tokens[0].line, "Unsupported node");
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
