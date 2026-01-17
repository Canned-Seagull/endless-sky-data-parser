import { DataNode } from "./data_node.ts";
import { errorAtLine } from "./error.ts";
import { GameData } from "./game_data.ts";
import { isEsNumber, parseEsNumber } from "./parser.ts";

export class Ship {
  readonly name: string;
  readonly baseName: string;
  readonly variantName?: string;
  readonly attributes = new Map<string, number>();
  readonly outfits = new Map<string, number>();

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
    this.name = this.baseName;

    if (dataNode.tokens.length === 2) {
      // This is a base ship

      for (const childNode of dataNode.children) {
        const childName = childNode.tokens[0].value;
        if (childName === "attributes") {
          for (const attributeNode of childNode.children) {
            const tokens = attributeNode.tokens;

            if (tokens.length < 2) continue;

            if (!isEsNumber(tokens[1].value)) continue;

            this.attributes.set(
              tokens[0].value,
              parseEsNumber(tokens[1].value),
            );
          }
        }
      }
    } else if (dataNode.tokens.length === 3) {
      // This is a variant
      this.variantName = dataNode.tokens[2].value;
      this.name = this.variantName;

      // Get base ship
      const baseShip = gameData.ships.get(this.baseName);
      // It is not recommended to derive a variant off another variant
      if (baseShip?.variantName) {
        console.warn("Deriving a variant ship off another variant");
      }
      // Copy base attributes
      baseShip?.attributes.forEach((value, attribute) =>
        this.attributes.set(attribute, value)
      );

      dataNode.children
        .find((childNode) =>
          childNode.tokens[0].value === "add" &&
          childNode.tokens[1]?.value === "attributes"
        )?.children
        .forEach((attributeNode) => {
          if (attributeNode.tokens.length < 2) return;

          const attribute = attributeNode.tokens[0].value;
          const value = attributeNode.tokens[1].value;
          if (!isEsNumber(value)) return;
          this.attributes.set(
            attribute,
            (this.attributes.get(attribute) ?? 0) + parseEsNumber(value),
          );
        });
    } else {
      errorAtLine(
        dataNode.tokens[0].line,
        "Ship node has more then three tokens",
      );
    }

    // Set outfits
    dataNode.children
      .find((childNode) => childNode.tokens[0].value === "outfits")?.children
      .forEach((outfitNode) => {
        const tokens = outfitNode.tokens;

        // Set the outfit, defaulting to a count of 1
        this.outfits.set(
          tokens[0].value,
          tokens.length >= 2 ? parseEsNumber(tokens[1].value) : 1,
        );
      });
  }

  clone(): Ship {
    return new Ship(this.gameData, this.dataNode);
  }

  getAttribute(attributeName: string): number {
    return this.outfits
      .entries()
      .reduce(
        (value, [outfitName, count]) =>
          value +
          (this.gameData.outfits.get(outfitName)?.attributes.get(
              attributeName,
            ) ?? 0) *
            count,
        this.attributes.get(attributeName) ?? 0,
      );
  }

  getOutfitCount(outfitName: string): number {
    return this.outfits.get(outfitName) ?? 0;
  }

  setOutfit(outfitName: string, count: number): void {
    this.outfits.set(outfitName, count);
  }
}
