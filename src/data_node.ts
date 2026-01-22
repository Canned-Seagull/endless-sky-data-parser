import type { ItemToken } from "./lexer.ts";

export class DataNode {
  public readonly tokens: ItemToken[] = [];
  public readonly children: DataNode[] = [];

  constructor(tokens: ItemToken[], children: DataNode[]) {
    this.tokens = tokens;
    this.children = children;
  }
}
