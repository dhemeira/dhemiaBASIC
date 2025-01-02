import { isAlpha, isDigit, isAlphanumeric } from './utils';

export enum TokenType {
  EOF = -1,
  NEWLINE = 0,
  NUMBER = 1,
  IDENT = 2,
  STRING = 3,
  // Keywords.
  LABEL = 101,
  GOTO = 102,
  PRINT = 103,
  INPUT = 104,
  LET = 105,
  IF = 106,
  THEN = 107,
  ENDIF = 108,
  WHILE = 109,
  REPEAT = 110,
  ENDWHILE = 111,
  // Operators.
  EQ = 201,
  PLUS = 202,
  MINUS = 203,
  ASTERISK = 204,
  SLASH = 205,
  EQEQ = 206,
  NOTEQ = 207,
  LT = 208,
  LTEQ = 209,
  GT = 210,
  GTEQ = 211,
}

class Token {
  type: TokenType;
  value: string;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

  static checkIfKeyword(token: string) {
    for (let nameOfType in TokenType) {
      if (isNaN(Number(nameOfType))) {
        let valueOfType = TokenType[nameOfType as keyof typeof TokenType];
        if (nameOfType === token.toUpperCase() && valueOfType > 100 && valueOfType < 200) {
          return nameOfType;
        }
      }
    }
    return null;
  }
}

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
  nextChar() {
    this.curPos++;
    if (this.curPos >= this.source.length) {
      this.curChar = '\0'; // EOF
    } else {
      this.curChar = this.source[this.curPos];
    }
  }

  // Return the lookahead character.
  peek() {
    if (this.curPos + 1 >= this.source.length) {
      return '\0';
    }
    return this.source[this.curPos + 1];
  }

  // Invalid token found, print error message and exit.
  abort(message: string) {
    throw new Error(`LEXING ERROR: ${message}`);
  }

  // Skip whitespace except newlines, which we will use to indicate the end of a statement.
  skipWhitespace() {
    while (this.curChar == ' ' || this.curChar == '\t' || this.curChar == '\r') {
      this.nextChar();
    }
  }

  // Skip comments in the code.
  skipComment() {
    const firstChar = this.curChar;
    if (firstChar == '/' && this.peek() == '/') {
      while (this.curChar != '\n') {
        this.nextChar();
      }
    }
  }

  // Return the next token.
  public getToken() {
    this.skipWhitespace();
    this.skipComment();
    let token: Token | null = null;

    // Check the first character of this token to see if we can decide what it is.
    // If it is a multiple character operator (e.g., !=), number, identifier, or keyword then we will process the rest.
    if (this.curChar == '+') token = new Token(TokenType.PLUS, this.curChar);
    else if (this.curChar == '-') token = new Token(TokenType.MINUS, this.curChar);
    else if (this.curChar == '*') token = new Token(TokenType.ASTERISK, this.curChar);
    else if (this.curChar == '/') token = new Token(TokenType.SLASH, this.curChar);
    else if (this.curChar == '=') {
      if (this.peek() == '=') {
        let lastChar = this.curChar;
        this.nextChar();
        token = new Token(TokenType.EQEQ, lastChar + this.curChar);
      } else token = new Token(TokenType.EQ, this.curChar);
    } else if (this.curChar == '<') {
      if (this.peek() == '=') {
        let lastChar = this.curChar;
        this.nextChar();
        token = new Token(TokenType.LTEQ, lastChar + this.curChar);
      } else token = new Token(TokenType.LT, this.curChar);
    } else if (this.curChar == '>') {
      if (this.peek() == '=') {
        let lastChar = this.curChar;
        this.nextChar();
        token = new Token(TokenType.GTEQ, lastChar + this.curChar);
      } else token = new Token(TokenType.GT, this.curChar);
    } else if (this.curChar == '!') {
      if (this.peek() == '=') {
        let lastChar = this.curChar;
        this.nextChar();
        token = new Token(TokenType.NOTEQ, lastChar + this.curChar);
      } else this.abort(`Expected !=, got !${this.peek()}`);
    } else if (this.curChar == '\n') token = new Token(TokenType.NEWLINE, this.curChar);
    else if (this.curChar == '\0') token = new Token(TokenType.EOF, '');
    else if (this.curChar == '"') {
      this.nextChar();
      let start = this.curPos;
      while (this.curChar != '"') {
        if (
          this.curChar == '\r' ||
          this.curChar == '\n' ||
          this.curChar == '\t' ||
          this.curChar == '\\' ||
          this.curChar == '%'
        )
          this.abort('Illegal character in string.');
        this.nextChar();
      }

      const tokenText = this.source.substring(start, this.curPos);
      token = new Token(TokenType.STRING, tokenText);
    } else if (isDigit(this.curChar)) {
      let start = this.curPos;
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
      token = new Token(TokenType.NUMBER, tokenText);
    } else if (isAlpha(this.curChar)) {
      let start = this.curPos;
      while (isAlphanumeric(this.peek())) {
        this.nextChar();
      }

      const tokenText = this.source.substring(start, this.curPos + 1);
      let keyword = Token.checkIfKeyword(tokenText);
      if (keyword) token = new Token(TokenType[keyword as keyof typeof TokenType], tokenText);
      else token = new Token(TokenType.IDENT, tokenText);
    } else this.abort(`Unknown token: ${this.curChar}`);

    this.nextChar();
    return token;
  }
}
