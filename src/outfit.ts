import type { DataNode } from "./data_node.ts";
import type { GameData } from "./game_data.ts";

export class Outfit {
  public readonly gameData: GameData;
  public readonly dataNodes: DataNode[] = [];

  public isInitialised: boolean = false;

  public name?: string;
  public displayName?: string;

  public readonly attributes: Map<string, number> = new Map<string, number>();

  /**
   * Constructs a new empty outfit with no data.
   *
   * @param {GameData} gameData - Game data object in which the outfit lives in
   */
  constructor(gameData: GameData) {
    this.gameData = gameData;
  }

  /**
   * Loads data from a data node into the outfit.
   * Merges with and does not overwrite existing data.
   * The data node can be an `outfit` node, or the `attributes` node of a ship.
   *
   * @param {DataNode} dataNode - Data node containing outfit data
   */
  public loadDataNode(dataNode: DataNode): void {
    this.dataNodes.push(dataNode);

    this.isInitialised = true;

    // Outfits can be loaded from an `attributes` or `add attributes` node
    // Therefore, cannot assume that it has a name
    if (dataNode.tokens[0].value === "outfit" && dataNode.tokens.length >= 2) {
      this.name = dataNode.tokens[1].value;
    }

    for (const childNode of dataNode.children) {
      if (childNode.tokens.length >= 2) {
        const childNodeName = childNode.tokens[0].value;

        if (childNodeName === "display name") {
          this.displayName = childNode.tokens[1].value;
        } else if (
          childNode.tokens[0].value === "category" ||
          childNodeName === "series" ||
          childNodeName === "index" ||
          childNodeName === "plural" ||
          childNodeName === "flare sprite" ||
          childNodeName === "reverse flare sprite" ||
          childNodeName === "steering flare sprite" ||
          childNodeName === "flare sound" ||
          childNodeName === "reverse flare sound" ||
          childNodeName === "steering flare sound" ||
          childNodeName === "afterburner effect" ||
          childNodeName === "jump effect" ||
          childNodeName === "hyperdrive sound" ||
          childNodeName === "hyperdrive in sound" ||
          childNodeName === "hyperdrive out sound" ||
          childNodeName === "category" ||
          childNodeName === "jump sound" ||
          childNodeName === "jump in sound" ||
          childNodeName === "jump out sound" ||
          childNodeName === "cargo scan sound" ||
          childNodeName === "outfit scan sound" ||
          childNodeName === "flotsam sprite" ||
          childNodeName === "thumbnail" ||
          childNodeName === "weapon" ||
          childNodeName === "ammo" ||
          childNodeName === "description" ||
          childNodeName === "cost" ||
          childNodeName === "mass" ||
          childNodeName === "licenses" ||
          childNodeName === "jump range"
        ) {
          // Exclude a list of unimplemented child node names so they do not get included in the attributes
          console.warn("Unsupported node: " + childNodeName);
          continue;
        } else {
          // Part of the attributes

          // Likely a mistake that the attribute contains non-numbers
          if (!childNode.tokens[1].isNumber()) {
            console.warn("Node cannot be parsed as a number: " + childNodeName);
          }

          this.attributes.set(
            childNode.tokens[0].value,
            childNode.tokens[1].toNumber(),
          );
        }
      }
    }
  }

  /**
   * Adds another outfit's stats to this outfit's stats and mutates itself.
   * The result of each merged stat will be the sum of the individual outfits' stats.
   *
   * @param {Outfit} other - The other outfit
   * @param {number} [count=0] - Number of the other outfit
   */
  public mergeWith(other: Outfit, count: number = 1): void {
    other.attributes.forEach((value, attribute) => {
      this.attributes.set(
        attribute,
        (this.attributes.get(attribute) ?? 0) + value * count,
      );
    });
  }
}
