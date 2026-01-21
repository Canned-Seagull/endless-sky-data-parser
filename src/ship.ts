import type { DataNode } from "./data_node.ts";
import { errorAtLine } from "./error.ts";
import type { GameData } from "./game_data.ts";
import { dataNodesToKeyNumberPairs } from "./utilities.ts";

export class Ship {
  readonly name: string;
  readonly baseName: string;
  readonly variantName?: string;
  readonly isVariant: boolean;

  private readonly baseAttributes: Map<string, number>[] = [];
  private readonly addAttributes: Map<string, number>[] = [];

  readonly outfits: Map<string, number> = new Map<string, number>();

  readonly gameData: GameData;
  readonly dataNode: DataNode;

  constructor(gameData: GameData, dataNode: DataNode) {
    if (dataNode.tokens.length < 2) {
      errorAtLine(
        dataNode.tokens[0].line,
        "Ship node has less than two tokens",
      );
    }

    this.gameData = gameData;
    this.dataNode = dataNode;

    this.baseName = dataNode.tokens[1].value;

    this.isVariant = dataNode.tokens.length >= 3;

    // This is a variant
    if (this.isVariant) {
      this.variantName = dataNode.tokens[2].value;

      // Get base ship
      const baseShip = gameData.ships.get(this.baseName);
      if (!baseShip) throw new Error("Base ship not found");

      // It is not recommended to derive a variant off another variant
      if (baseShip.isVariant) {
        console.warn("Deriving a variant ship off another variant");
      }
    }

    this.name = this.variantName ?? this.baseName;

    for (const childNode of dataNode.children) {
      if (childNode.tokens[0].value === "attributes") {
        // Set attributes
        this.baseAttributes.push(dataNodesToKeyNumberPairs(childNode.children));
      } else if (
        childNode.tokens[0].value === "add" &&
        childNode.tokens[1]?.value === "attributes"
      ) {
        // Set add attributes
        this.addAttributes.push(dataNodesToKeyNumberPairs(childNode.children));
      } else if (childNode.tokens[0].value === "outfits") {
        this.outfits = dataNodesToKeyNumberPairs(childNode.children, 1);
      } else console.warn("Unsupported node");
    }
  }

  clone(): Ship {
    return new Ship(this.gameData, this.dataNode);
  }

  get attributes(): Map<string, number> {
    const attributes = new Map<string, number>();

    if (this.isVariant) {
      const baseShip = this.gameData.ships.get(this.baseName);
      if (!baseShip) throw new Error("Base ship not found");

      // Initialise attributes with the base ship's attributes
      baseShip.attributes.forEach((value, attribute) =>
        attributes.set(attribute, value)
      );
    }

    // For each base attribute, override existing attribute
    this.baseAttributes.forEach((base) => {
      base.forEach((value, attribute) => attributes.set(attribute, value));
    });

    // For each add attribute, add on existing attribute
    this.addAttributes.forEach((add) => {
      add.forEach((value, attribute) =>
        attributes.set(attribute, (attributes.get(attribute) ?? 0) + value)
      );
    });

    // For each outfit, add on existing attribute
    this.outfits.forEach((count, outfitName) => {
      const outfit = this.gameData.outfits.get(outfitName);
      if (!outfit) throw new Error("Outfit not found: " + outfitName);

      outfit.attributes.forEach((value, attribute) =>
        attributes.set(
          attribute,
          (attributes.get(attribute) ?? 0) + value * count,
        )
      );
    });

    return attributes;
  }

  getOutfitCount(outfitName: string): number {
    return this.outfits.get(outfitName) ?? 0;
  }

  setOutfit(outfitName: string, count: number): void {
    this.outfits.set(outfitName, count);
  }
}
