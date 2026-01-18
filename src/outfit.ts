import { DataNode } from "./data_node.ts";
import { errorAtDataFileLine } from "./error.ts";
import { GameData } from "./game_data.ts";
import { isEsNumber, parseEsNumber } from "./parser.ts";

export class Outfit {
  readonly name: string;
  readonly attributes = new Map<string, number>();

  readonly gameData: GameData;
  readonly dataNode: DataNode;

  // Constructs a new outfit from a given data node
  constructor(gameData: GameData, dataNode: DataNode) {
    if (dataNode.tokens.length < 2) {
      errorAtDataFileLine(
        dataNode.tokens[0].line,
        "Outfit node has less than two tokens",
      );
    }

    this.gameData = gameData;
    this.dataNode = dataNode;

    this.name = dataNode.tokens[1].value;

    for (const childNode of dataNode.children) {
      const tokens = childNode.tokens;

      if (tokens.length >= 2) {
        if (!isEsNumber(tokens[1].value)) continue;

        this.attributes.set(tokens[0].value, parseEsNumber(tokens[1].value));
      }
    }
  }

  // Combines another outfit's stats with this outfit
  merge(other: Outfit, count: number): Outfit {
    other.attributes.forEach((value, attribute) => {
      this.attributes.set(
        attribute,
        (this.attributes.get(attribute) ?? 0) + value * count,
      );
    });

    return this;
  }
}
