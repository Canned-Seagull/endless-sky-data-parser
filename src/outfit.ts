import type { DataNode } from "./data_node.ts";
import type { GameData } from "./game_data.ts";

export class Outfit {
  public readonly gameData: GameData;
  public readonly dataNodes: DataNode[] = [];

  public isInitialised: boolean = false;

  public name?: string;
  public displayName?: string;

  public description?: string;

  public category?: string;

  public licenses: string[] = [];

  public thumbnail?: string;

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
      if (childNode.tokens.length === 1) {
        const childNodeName = childNode.tokens[0].value;

        if (childNodeName === "licenses") {
          childNode.children.forEach((licenseNode) => {
            this.licenses.push(licenseNode.tokens[0].value);
          });
        }
      } else if (childNode.tokens.length >= 2) {
        const childNodeName = childNode.tokens[0].value;
        const valueNode = childNode.tokens[1];

        if (childNodeName === "category") {
          this.category = valueNode.value;
        } else if (childNodeName === "description") {
          this.description = valueNode.value;
        } else if (childNodeName === "display name") {
          this.displayName = valueNode.value;
        } else if (childNodeName === "thumbnail") {
          this.thumbnail = valueNode.value;
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
          childNodeName === "weapon" ||
          childNodeName === "ammo" ||
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

  /**
   * Calculates whether a ship represented by this outfit is valid.
   * Most attributes cannot have a value below `0`, with exceptions.
   *
   * @returns {boolean} - Whether or not this ship is valid
   */
  public isValidShip(): boolean {
    for (const [attribute, value] of this.attributes) {
      // All the protection attributes that have a minimum value of -0.99
      if (
        (attribute === "shield protection" ||
          attribute === "hull protection" ||
          attribute === "energy protection" ||
          attribute === "fuel protection" ||
          attribute === "heat protection" ||
          attribute === "piercing protection" ||
          attribute === "force protection" ||
          attribute === "discharge protection" ||
          attribute === "drag protection" ||
          attribute === "corrosion protection" ||
          attribute === "inertia protection" ||
          attribute === "ion protection" ||
          attribute === "scramble protection" ||
          attribute === "leak protection" ||
          attribute === "burn protection" ||
          attribute === "disruption protection" ||
          attribute === "slowing protection") &&
        value >= -0.99
      ) continue;

      // All the multiplier attributes that have a minimum value of -1
      if (
        (attribute === "hull multiplier" ||
          attribute === "hull repair multiplier" ||
          attribute === "hull energy multiplier" ||
          attribute === "hull fuel multiplier" ||
          attribute === "hull heat multiplier" ||
          attribute === "cloaked repair multiplier" ||
          attribute === "shield multiplier" ||
          attribute === "shield generation multiplier" ||
          attribute === "shield energy multiplier" ||
          attribute === "shield fuel multiplier" ||
          attribute === "shield heat multiplier" ||
          attribute === "cloaked regen multiplier" ||
          attribute === "acceleration multiplier" ||
          attribute === "turn multiplier" ||
          attribute === "turret turn multiplier") && value >= -1
      ) continue;

      // Any other attribute has a minimum value of 0
      if (value >= 0) continue;

      return false;
    }

    return true;
  }

  /**
   * Clones the outfit object, which can be modified without affecting the original.
   *
   * @returns {Outfit} - Cloned outfit object
   */
  public clone(): Outfit {
    const outfit = new Outfit(this.gameData);

    // Copy data nodes by reference
    this.dataNodes.forEach((dataNode) => outfit.dataNodes.push(dataNode));

    // Copy all the other properties by value
    outfit.isInitialised = this.isInitialised;
    outfit.name = this.name;
    outfit.displayName = this.displayName;
    outfit.description = this.description;
    outfit.category = this.category;
    this.licenses.forEach((license) => outfit.licenses.push(license));
    outfit.thumbnail = this.thumbnail;
    this.attributes.forEach((value, attribute) =>
      outfit.attributes.set(attribute, value)
    );

    return outfit;
  }
}
