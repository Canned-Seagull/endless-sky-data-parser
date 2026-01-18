import { DataNode } from "./data_node.ts";
import { DataSource } from "./data_source.ts";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";

/**
 * A file containing game data.
 */
export class DataFile {
  readonly path: string;
  readonly content: string;
  readonly dataSource?: DataSource;
  readonly rootNode: DataNode;

  /**
   * Constructs a new data file and parses its contents.
   *
   * @param {string} path - Path of the file within its source without a leading slash
   * @param {string} content - Data content of the file
   * @param {DataSource} dataSource - Source of the file
   */
  constructor(path: string, content: string, dataSource?: DataSource) {
    this.path = path;
    this.content = content;

    this.dataSource = dataSource;

    const lexer = new Lexer(this, content);
    const tokens = lexer.tokenise();
    const parser = new Parser(this, tokens);
    const rootNode = parser.parse();

    this.rootNode = rootNode;
  }
}
