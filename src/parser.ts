import { DataNode } from "./data_node.ts";
import { errorAtLine } from "./error.ts";
import { ItemToken, Token, TokenType } from "./lexer.ts";

export class Parser {
  private readonly tokens: Token[];
  private currentPos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): DataNode {
    const children = [];

    while (!this.isAtEnd()) children.push(this.parseNode());

    return new DataNode([], children);
  }

  parseNode(): DataNode {
    const indentation = this.consumeIndentation();

    const tokens = [];

    while (!this.isAtEnd() && this.peek().type !== TokenType.NEWLINE) {
      const token = this.consume();
      if (token instanceof ItemToken) tokens.push(token);
    }

    // Missing newline at the end of the file
    if (this.isAtEnd()) {
      errorAtLine(this.peek().line, "Missing newline at the end of file");
    }

    this.consume();

    const children = [];

    let nextIndentation = this.peekIndentation();

    while (nextIndentation > indentation && !this.isAtEnd()) {
      children.push(this.parseNode());

      const nextNextIndentation = this.peekIndentation();

      /*
      Check if child indentation levels are the same to avoid a situation like:

      ```
      first
          second
        third
      ```
      */
      if (
        nextNextIndentation > indentation &&
        nextNextIndentation !== nextIndentation
      ) {
        errorAtLine(this.peek().line, "Unequal indentation");
      }

      nextIndentation = nextNextIndentation;
    }

    return new DataNode(tokens, children);
  }

  private peek(): Token {
    return this.tokens[this.currentPos];
  }

  private lookahead(offset: number): Token {
    return this.tokens[this.currentPos + offset];
  }

  private peekIndentation(): number {
    let indentation = 0;
    let offset = 0;
    
    while (this.lookahead(offset).type !== TokenType.TOKEN) {
      if (this.lookahead(offset).type === TokenType.EOF) break;
      else if (this.lookahead(offset).type === TokenType.NEWLINE) {
        indentation = 0;
        offset++;
      } else {
        indentation++;
        offset++;
      }
    }

    return indentation;
  }

  consume(): Token {
    return this.tokens[this.currentPos++];
  }

  consumeIndentation(): number {
    let indentation = 0;
    while (this.peek().type !== TokenType.TOKEN) {
      if (this.peek().type === TokenType.EOF) break;
      else if (this.peek().type === TokenType.NEWLINE) {
        indentation = 0;
        this.consume();
      } else {
        indentation++;
        this.consume();
      }
    }

    return indentation;
  }

  isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }
}

export function isEsNumber(attribute: string): boolean {
  return !isNaN(parseEsNumber(attribute));
}

export function parseEsNumber(attribute: string): number {
  // TODO: Use the ES number parsing algorithm
  return Number(attribute);
}
