import { errorAtLine } from "./error.ts";

export enum TokenType {
  TOKEN,
  INDENT,
  NEWLINE,
  EOF,
}

export abstract class Token {
  abstract readonly type: TokenType;
  readonly lexeme: string;
  readonly line: number;

  constructor(
    lexeme: string,
    line: number,
  ) {
    this.lexeme = lexeme;
    this.line = line;
  }
}

export class ItemToken extends Token {
  readonly type = TokenType.TOKEN;
  readonly value: string;

  constructor(lexeme: string, line: number, value: string) {
    super(lexeme, line);

    this.value = value;
  }
}

export class IndentToken extends Token {
  readonly type = TokenType.INDENT;
}

export class NewlineToken extends Token {
  readonly type = TokenType.NEWLINE;
}

export class EofToken extends Token {
  readonly type = TokenType.EOF;
}

export class Lexer {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private startPos = 0;
  private currentPos = 0;
  private currentLine = 0;

  constructor(source: string) {
    this.source = source;
  }

  tokenise(): Token[] {
    while (!this.isAtEnd()) {
      this.startPos = this.currentPos;
      this.next();
    }

    this.emitEofToken();
    return this.tokens;
  }

  private next(): void {
    const c = this.consume();

    switch (c) {
      case "\t":
      case " ":
        this.emitIndentToken();
        break;
      case '"':
        this.quotedToken();
        this.consumeWhitespace();
        break;
      case "`":
        this.backtickedToken();
        this.consumeWhitespace();
        break;
      case "#":
        while (this.peek() !== "\n" && !this.isAtEnd()) this.consume();
        break;
      case "\n":
        this.currentLine++;
        this.emitNewlineToken();
        break;
      default:
        this.unquotedToken();
        this.consumeWhitespace();
    }
  }

  private quotedToken(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        errorAtLine(this.currentLine, "Unexpected newline");
      }

      this.consume();
    }

    // Endless Sky does not treat this as a fatal error
    if (this.isAtEnd()) errorAtLine(this.currentLine, "Unterminated string");

    this.consume();
    const value = this.source.slice(this.startPos + 1, this.currentPos - 1);
    this.emitItemToken(value);
  }

  private backtickedToken(): void {
    while (this.peek() !== "`" && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        errorAtLine(this.currentLine, "Unexpected newline");
      }

      this.consume();
    }

    // Endless Sky does not treat this as a fatal error
    if (this.isAtEnd()) errorAtLine(this.currentLine, "Unterminated string");

    this.consume();
    const value = this.source.slice(this.startPos + 1, this.currentPos - 1);
    this.emitItemToken(value);
  }

  private unquotedToken(): void {
    while (this.peek() !== " " && this.peek() !== "\n" && !this.isAtEnd()) {
      this.consume();
    }

    const value = this.source.slice(this.startPos, this.currentPos);
    this.emitItemToken(value);
  }

  private consumeWhitespace(): void {
    while (this.peek() === " " && this.peek() !== "\n" && !this.isAtEnd()) {
      this.consume();
    }
  }

  private emitEofToken(): void {
    this.tokens.push(new EofToken("", this.currentLine));
  }

  private emitIndentToken(): void {
    const text = this.source.slice(this.startPos, this.currentPos);
    this.tokens.push(new IndentToken(text, this.currentLine));
  }

  private emitItemToken(value: string): void {
    const lexeme = this.source.slice(this.startPos, this.currentPos);
    this.tokens.push(new ItemToken(lexeme, this.currentLine, value));
  }

  private emitNewlineToken(): void {
    const text = this.source.slice(this.startPos, this.currentPos);
    this.tokens.push(new NewlineToken(text, this.currentLine));
  }

  private consume(): string {
    return this.source[this.currentPos++];
  }

  private peek(): string | undefined {
    return this.source[this.currentPos];
  }

  private isAtEnd(): boolean {
    return this.currentPos >= this.source.length;
  }
}
