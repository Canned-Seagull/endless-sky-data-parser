import type { DataNode } from "./data_node.ts";
import { errorAtLine } from "./error.ts";
import type { GameData } from "./game_data.ts";
import { Outfit } from "./outfit.ts";
import { dataNodesToKeyNumberPairs } from "./utilities.ts";

export class Ship {
  /**
   * Game data object in which the ship lives in.
   */
  public readonly gameData: GameData;
  /**
   * Data nodes from which ship data has been loaded.
   */
  public readonly dataNodes: DataNode[] = [];

  /**
   * Whether the ship has any data loaded.
   * Will be set to `true` the first time data is loaded.
   */
  public isInitialised: boolean = false;

  /**
   * Whether or not the ship is a variant, or a base ship.
   */
  public isVariant: boolean = false;

  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public name: string = "";
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public baseName: string = "";
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public variantName?: string;
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public description?: string;
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public baseAttributes?: Outfit;
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public addAttributes?: Outfit;
  /**
   * The name of the thumbnail sprite of the ship if defined.
   * Corresponds to the `thumbnail` node.
   *
   * Only takes into account thumbnails directly defined on this ship,
   * will not consider thumbnails defined on a variant's base ship.
   * For most purposes, access thumbnails using the `thumbnail` getter instead.
   *
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public selfThumbnail?: string;
  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public thumbnail?: string;

  /**
   * See the [Endless Sky wiki](https://github.com/endless-sky/endless-sky/wiki/).
   */
  public readonly outfits: Map<string, number> = new Map();

  /**
   * Constructs a new empty ship with no data.
   *
   * @param {GameData} gameData - Game data object in which the ship lives in
   */
  constructor(gameData: GameData) {
    this.gameData = gameData;
  }

  /**
   * Get the computed attributes list, combining attributes of the ship and of outfits.
   */
  get attributes(): Outfit {
    let attributes = new Outfit(this.gameData);

    // Initialise the currently empty attributes with base attributes
    if (this.baseAttributes) {
      // Initialise with base attributes
      attributes = this.baseAttributes.clone();
    } else if (this.isVariant) {
      // If no base attributes and this is a variant, initialise with the base ship if it exists
      const baseShip = this.gameData.ships.get(this.baseName);
      if (!baseShip) console.warn(`Base ship not found: ${this.baseName}`);
      else attributes = baseShip.attributes.clone();
    }

    if (this.addAttributes) {
      // Add the add attributes on the base attributes
      attributes.mergeWith(this.addAttributes);
    }

    // For each outfit, add its attributes
    this.outfits.forEach((count, outfitName) => {
      const outfit = this.gameData.outfits.get(outfitName);
      if (!outfit) {
        console.warn(`Outfit not defined: ${outfitName}`);
        return;
      }

      attributes.mergeWith(outfit, count);
    });

    return attributes;
  }

  /**
   * If this is a variant, returns the base ship object from game data.
   * Returns `undefined` if this is not a variant, or if the base ship was not found.
   */
  get baseShip(): Ship | undefined {
    if (!this.isVariant) return undefined;

    const baseShip = this.gameData.ships.get(this.baseName);
    if (!baseShip) console.warn(`Base ship not found: ${this.baseName}`);

    return baseShip;
  }

  /**
   * Get the name of the thumbnail sprite if defined.
   *
   * If this is a variant ship, self thumbnail will be used if defined.
   * Otherwise, returns base ship thumbnail.
   */
  get thumbnail(): string | undefined {
    return this.selfThumbnail ?? this.baseShip?.thumbnail;
  }

  /**
   * Loads ship data from a data node.
   *
   * @param {DataNode} dataNode - Data node to load from
   */
  public loadDataNode(dataNode: DataNode): void {
    this.dataNodes.push(dataNode);

    this.isInitialised = true;

    if (dataNode.tokens.length < 2) {
      errorAtLine(
        dataNode.tokens[0].line,
        `Ship node has less than two tokens: ${dataNode.tokens[1].value}`,
      );
    }

    this.baseName = dataNode.tokens[1].value;

    this.isVariant = dataNode.tokens.length >= 3;

    // This is a variant
    if (this.isVariant) {
      this.variantName = dataNode.tokens[2].value;

      // Get base ship
      const baseShip = this.gameData.ships.get(this.baseName);

      // Should be an error, but will be forgiving here
      if (!baseShip) console.warn("Base ship not found: " + this.baseName);
      // It is not recommended to derive a variant off another variant
      else if (baseShip.isVariant) {
        console.warn(
          `Deriving a variant ship ${this.variantName} off another variant ${this.baseName}`,
        );
      }
    }

    this.name = this.variantName ?? this.baseName;

    for (const childNode of dataNode.children) {
      if (childNode.tokens[0].value === "attributes") {
        // Create base attributes if it does not exist yet
        if (!this.baseAttributes) {
          this.baseAttributes = new Outfit(this.gameData);
        }

        // Set attributes, merging with any existing
        this.baseAttributes.loadDataNode(childNode);
      } else if (
        childNode.tokens[0].value === "add" &&
        childNode.tokens[1]?.value === "attributes"
      ) {
        // Create add attributes if it does not exist yet
        if (!this.addAttributes) this.addAttributes = new Outfit(this.gameData);

        // Set add attributes, merging with any existing
        this.addAttributes.loadDataNode(childNode);
      } else if (childNode.tokens[0].value === "outfits") {
        dataNodesToKeyNumberPairs(childNode.children, 1)
          .forEach((count, outfit) => {
            this.outfits.set(outfit, count);
          });
      } else if (childNode.tokens.length >= 2) {
        const childNodeName = childNode.tokens[0].value;
        const valueNode = childNode.tokens[1];

        if (childNodeName === "description") {
          this.description = valueNode.value;
        } else if (childNodeName === "thumbnail") {
          this.selfThumbnail = valueNode.value;
        } else {
          console.warn(`Unsupported node: ${childNodeName}`);
        }
      } else console.warn(`Unsupported node: ${childNode.tokens[0].value}`);
    }
  }

  /**
   * Whether or not you can install an outfit on this ship.
   *
   * @param {string} outfitName - Name of the outfit
   * @param {number} [count=1] - Amount of the outfit to install
   * @returns {boolean} - Whether or not you can install the outfits
   */
  public canInstallOutfit(outfitName: string, count: number = 1): boolean {
    const outfit = this.gameData.outfits.get(outfitName);

    if (!outfit) throw new Error(`Outfit not found: ${outfitName}`);

    const attributes = this.attributes;
    attributes.mergeWith(outfit, count);

    return attributes.isValidShip();
  }

  /**
   * Installs an outfit on this ship.
   *
   * @param {string} outfitName - Name of the outfit
   * @param {number} [count=1] - Amount of the outfit to install
   */
  public installOutfit(outfitName: string, count: number = 1): void {
    this.outfits.set(outfitName, (this.outfits.get(outfitName) ?? 0) + count);
  }

  /**
   * Clones the ship object, which can be modified without affecting the original.
   *
   * @returns {Ship} - Cloned ship object
   */
  public clone(): Ship {
    const ship = new Ship(this.gameData);

    // Copy data nodes by reference
    this.dataNodes.forEach((dataNode) => ship.dataNodes.push(dataNode));

    // Copy all the other properties by value
    ship.isInitialised = this.isInitialised;
    ship.isVariant = this.isVariant;
    ship.name = this.name;
    ship.baseName = this.baseName;
    ship.variantName = this.variantName;
    ship.description = this.description;
    ship.baseAttributes = this.baseAttributes?.clone();
    ship.addAttributes = this.addAttributes?.clone();
    ship.selfThumbnail = this.selfThumbnail;
    this.outfits.forEach((count, outfit) => ship.outfits.set(outfit, count));

    return ship;
  }
}
