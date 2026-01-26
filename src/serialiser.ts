import type { DataNode } from "./data_node.ts";

// Serialise a data node into data file source
export function serialiseDataNode(node: DataNode): string {
  function serialise(node: DataNode): string[] {
    const line = node.tokens.map((token) => {
      if (token.value.includes(" ")) {
        if (token.value.includes('"')) return "`" + token.value + "`";
        else return '"' + token.value + '"';
      } else return token.value;
    }).join(" ");
    const children = node.children
      .map(serialise)
      .flat()
      .map((line) => "\t" + line);
    return [line, ...children];
  }

  return serialise(node).join("\n");
}
