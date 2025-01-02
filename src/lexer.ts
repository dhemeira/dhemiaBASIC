import { isAlpha, isDigit, isAlphanumeric } from './utils';
import { TokenType } from './tokenType';
import { Token } from './token';

export class Lexer {
  source: string;
  curChar: string;
  curPos: number;

  constructor(source: string) {
    this.source = source + '\n'; // The source code to lex
    this.curChar = ''; // Current character in the source
    this.curPos = -1; // Current position in the source
    this.nextChar(); // Load the first character into current character
  }

  // Process the next character.
  private nextChar() {
    this.curPos++;
    if (this.curPos >= this.source.length) {
      this.curChar = '\0'; // EOF
    } else {
      this.curChar = this.source[this.curPos];
    }
  }

  // Return the lookahead character.
  private peek(): string {
    if (this.curPos + 1 >= this.source.length) {
      return '\0';
    }
    return this.source[this.curPos + 1];
  }

  // Invalid token found, print error message and exit.
  private abort(message: string) {
    throw new Error(`LEXING ERROR: ${message}`);
  }

  // Skip whitespace except newlines, which we will use to indicate the end of a statement.
  private skipWhitespace() {
    while (this.curChar == ' ' || this.curChar == '\t' || this.curChar == '\r') {
      this.nextChar();
    }
  }

  // Skip comments in the code.
  private skipComment() {
    const firstChar = this.curChar;
    if (firstChar == '/' && this.peek() == '/') {
      while (this.curChar != '\n') {
        this.nextChar();
      }
    }
  }

  // Return the next token.
  public getToken(): Token {
    this.skipWhitespace();
    this.skipComment();
    let token: Token = new Token(TokenType.NONE, '');

    switch (this.curChar) {
      case '+':
        token = new Token(TokenType.PLUS, this.curChar);
        break;
      case '-':
        token = new Token(TokenType.MINUS, this.curChar);
        break;
      case '*':
        token = new Token(TokenType.ASTERISK, this.curChar);
        break;
      case '/':
        token = new Token(TokenType.SLASH, this.curChar);
        break;
      case '=':
        token =
          this.peek() == '='
            ? this.createTwoCharToken(TokenType.EQEQ)
            : new Token(TokenType.EQ, this.curChar);
        break;
      case '<':
        token =
          this.peek() == '='
            ? this.createTwoCharToken(TokenType.LTEQ)
            : new Token(TokenType.LT, this.curChar);
        break;
      case '>':
        token =
          this.peek() == '='
            ? this.createTwoCharToken(TokenType.GTEQ)
            : new Token(TokenType.GT, this.curChar);
        break;
      case '!':
        if (this.peek() == '=') {
          token = this.createTwoCharToken(TokenType.NOTEQ);
        } else {
          this.abort(`Expected !=, got !${this.peek()}`);
        }
        break;
      case '\n':
        token = new Token(TokenType.NEWLINE, this.curChar);
        break;
      case '\0':
        token = new Token(TokenType.EOF, '');
        break;
      case '"':
        token = this.readString();
        break;
      default:
        if (isDigit(this.curChar)) {
          token = this.readNumber();
        } else if (isAlpha(this.curChar)) {
          token = this.readIdentifierOrKeyword();
        } else {
          this.abort(`Unknown token: ${this.curChar}`);
        }
    }

    this.nextChar();
    return token;
  }

  private createTwoCharToken(type: TokenType): Token {
    const lastChar = this.curChar;
    this.nextChar();
    return new Token(type, lastChar + this.curChar);
  }

  private readString(): Token {
    this.nextChar();
    const start = this.curPos;
    while (this.curChar != '"') {
      if (['\r', '\n', '\t', '\\', '%'].includes(this.curChar)) {
        this.abort('Illegal character in string.');
      }
      this.nextChar();
    }
    const tokenText = this.source.substring(start, this.curPos);
    return new Token(TokenType.STRING, tokenText);
  }

  private readNumber(): Token {
    const start = this.curPos;
    while (isDigit(this.peek())) {
      this.nextChar();
    }
    if (this.peek() == '.') {
      this.nextChar();
      if (!isDigit(this.peek())) {
        this.abort('Illegal character in number.');
      }
      while (isDigit(this.peek())) {
        this.nextChar();
      }
    }
    const tokenText = this.source.substring(start, this.curPos + 1);
    return new Token(TokenType.NUMBER, tokenText);
  }

  private readIdentifierOrKeyword(): Token {
    const start = this.curPos;
    while (isAlphanumeric(this.peek())) {
      this.nextChar();
    }
    const tokenText = this.source.substring(start, this.curPos + 1);
    const keyword = Token.checkIfKeyword(tokenText);
    if (keyword) {
      return new Token(TokenType[keyword as keyof typeof TokenType], tokenText);
    }
    return new Token(TokenType.IDENT, tokenText);
  }
}
