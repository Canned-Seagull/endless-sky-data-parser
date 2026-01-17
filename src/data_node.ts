import { ItemToken } from "./lexer.ts";

export class DataNode {
  readonly tokens: ItemToken[] = [];
  readonly children: DataNode[] = [];

  constructor(tokens: ItemToken[], children: DataNode[]) {
    this.tokens = tokens;
    this.children = children;
  }
}
