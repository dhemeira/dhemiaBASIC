import { Lexer } from './lexer';
import { Token } from './token';
import { TokenType } from './tokenType';
import { print } from './utils';

export class Parser {
  lexer: Lexer;
  curToken: Token;
  peekToken: Token;
  symbols: Set<string>;
  labelsDeclared: Set<string>;
  labelsGotoed: Set<string>;

  constructor(lexer: Lexer) {
    this.lexer = lexer;

    this.symbols = new Set();
    this.labelsDeclared = new Set();
    this.labelsGotoed = new Set();

    this.curToken = new Token(TokenType.NONE, '');
    this.peekToken = new Token(TokenType.NONE, '');
    this.nextToken();
    this.nextToken();
  }

  // Return true if the current token matches.
  private checkToken(type: TokenType) {
    return type == this.curToken.type;
  }

  // Try to match current token. If not, error. Advances the current token.
  private match(type: TokenType) {
    if (!this.checkToken(type)) {
      this.abort(`Expected ${type}, got ${this.curToken.type}`);
    }
    this.nextToken();
  }

  // Advances the current token.
  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.getToken();
  }

  // Print error message and exit.
  private abort(message: string) {
    throw new Error(`ERROR: ${message}`);
  }

  public program() {
    print('PROGRAM');

    while (this.checkToken(TokenType.NEWLINE)) {
      this.nextToken();
    }

    while (!this.checkToken(TokenType.EOF)) {
      this.statement();
    }

    for (let label of this.labelsGotoed) {
      if (!this.labelsDeclared.has(label)) {
        this.abort(`Attempting to GOTO to undeclared label: ${label}`);
      }
    }
  }

  private statement() {
    if (this.checkToken(TokenType.PRINT)) {
      print('STATEMENT-PRINT');
      this.nextToken();

      if (this.checkToken(TokenType.STRING)) this.nextToken();
      else this.expr();
    } else if (this.checkToken(TokenType.IF)) {
      print('STATEMENT-IF');
      this.nextToken();
      this.comparison();

      this.match(TokenType.THEN);
      this.nl();

      while (!this.checkToken(TokenType.ENDIF)) this.statement();

      this.match(TokenType.ENDIF);
    } else if (this.checkToken(TokenType.WHILE)) {
      print('STATEMENT-WHILE');
      this.nextToken();
      this.comparison();

      this.match(TokenType.REPEAT);
      this.nl();

      while (!this.checkToken(TokenType.ENDWHILE)) this.statement();

      this.match(TokenType.ENDWHILE);
    } else if (this.checkToken(TokenType.LABEL)) {
      print('STATEMENT-LABEL');

      this.nextToken();

      if (this.labelsDeclared.has(this.curToken.value))
        this.abort(`Label ${this.curToken.value} already exists`);
      this.labelsDeclared.add(this.curToken.value);

      this.match(TokenType.IDENT);
    } else if (this.checkToken(TokenType.GOTO)) {
      print('STATEMENT-GOTO');

      this.nextToken();

      this.labelsGotoed.add(this.curToken.value);

      this.match(TokenType.IDENT);
    } else if (this.checkToken(TokenType.LET)) {
      print('STATEMENT-LET');

      this.nextToken();

      if (!this.symbols.has(this.curToken.value)) this.symbols.add(this.curToken.value);

      this.match(TokenType.IDENT);
      this.match(TokenType.EQ);

      this.expr();
    } else if (this.checkToken(TokenType.INPUT)) {
      print('STATEMENT-INPUT');

      this.nextToken();

      if (!this.symbols.has(this.curToken.value)) this.symbols.add(this.curToken.value);

      this.match(TokenType.IDENT);
    } else {
      this.abort(`Invalid statement at ${this.curToken.value} (${TokenType[this.curToken.type]})`);
    }

    this.nl();
  }

  private comparison() {
    print('COMPARISON');

    this.expr();
    if (this.isComparisonOperator()) {
      this.nextToken();
      this.expr();
    } else {
      this.abort(`Expected comparison operator at ${this.curToken.value}`);
    }

    while (this.isComparisonOperator()) {
      this.nextToken();
      this.expr();
    }
  }

  private isComparisonOperator() {
    return (
      this.checkToken(TokenType.EQEQ) ||
      this.checkToken(TokenType.NOTEQ) ||
      this.checkToken(TokenType.LT) ||
      this.checkToken(TokenType.LTEQ) ||
      this.checkToken(TokenType.GT) ||
      this.checkToken(TokenType.GTEQ)
    );
  }

  private expr() {
    print('EXPR');

    this.term();
    while (this.checkToken(TokenType.PLUS) || this.checkToken(TokenType.MINUS)) {
      this.nextToken();
      this.term();
    }
  }

  private term() {
    print('TERM');

    this.unary();
    while (this.checkToken(TokenType.ASTERISK) || this.checkToken(TokenType.SLASH)) {
      this.nextToken();
      this.unary();
    }
  }

  private unary() {
    print('UNARY');

    if (this.checkToken(TokenType.PLUS) || this.checkToken(TokenType.MINUS)) this.nextToken();
    this.primary();
  }

  private primary() {
    print(`PRIMARY (${this.curToken.value})`);

    if (this.checkToken(TokenType.NUMBER)) {
      this.nextToken();
    } else if (this.checkToken(TokenType.IDENT)) {
      if (!this.symbols.has(this.curToken.value))
        this.abort(`Referencing variable before assignment: ${this.curToken.value}`);
      this.nextToken();
    } else {
      this.abort(`Unexpected token at ${this.curToken.value}`);
    }
  }

  private nl() {
    print('NEWLINE');

    this.match(TokenType.NEWLINE);
    while (this.checkToken(TokenType.NEWLINE)) {
      this.nextToken();
    }
  }
}
