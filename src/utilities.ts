import type { DataNode } from "./data_node.ts";
import { isEsNumber, parseEsNumber } from "./parser.ts";

export function dataNodesToKeyNumberPairs(
  dataNodes: DataNode[],
  defaultValue?: number,
): Map<string, number> {
  const pairs = new Map<string, number>();

  dataNodes.forEach((attributeNode) => {
    const tokens = attributeNode.tokens;

    if (
      (tokens.length < 2 && !defaultValue) ||
      (tokens.length >= 2 && !isEsNumber(tokens[1].value))
    ) return;

    pairs.set(
      tokens[0].value,
      tokens.length >= 2 ? parseEsNumber(tokens[1].value) : defaultValue!,
    );
  });

  return pairs;
}
