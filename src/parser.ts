import { Lexer } from './lexer';
import { Token } from './token';
import { Emitter } from './emitter';
import { TokenType } from './tokenType';

export class Parser {
  lexer: Lexer;
  emitter: Emitter;
  curToken: Token;
  peekToken: Token;
  symbols: Set<string>;
  labelsDeclared: Set<string>;
  labelsGotoed: Set<string>;

  constructor(lexer: Lexer, emitter: Emitter) {
    this.lexer = lexer;
    this.emitter = emitter;

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
    this.emitter.headerLine('package main');
    this.emitter.headerLine('');
    this.emitter.headerLine('import "fmt"');
    this.emitter.headerLine('');
    this.emitter.headerLine('func main() {');
    this.emitter.tab();

    while (this.checkToken(TokenType.NEWLINE)) {
      this.nextToken();
    }

    while (!this.checkToken(TokenType.EOF)) {
      this.statement();
    }

    this.emitter.untab();
    this.emitter.emitLineTabbed('}');

    for (let label of this.labelsGotoed) {
      if (!this.labelsDeclared.has(label)) {
        this.abort(`Attempting to GOTO to undeclared label: ${label}`);
      }
    }
  }

  private statement() {
    if (this.checkToken(TokenType.PRINT)) {
      this.nextToken();

      if (this.checkToken(TokenType.STRING)) {
        this.emitter.emitLineTabbed(`fmt.Println("${this.curToken.value}")`);
        this.nextToken();
      } else {
        this.emitter.emitTabbed('fmt.Println(');
        this.expr();
        this.emitter.emitLine(')');
      }
    } else if (this.checkToken(TokenType.IF)) {
      this.nextToken();
      this.emitter.emitTabbed('if ');
      this.comparison();

      this.match(TokenType.THEN);
      this.nl();
      this.emitter.emitLine('{');
      this.emitter.tab();

      while (!this.checkToken(TokenType.ENDIF)) this.statement();

      this.match(TokenType.ENDIF);
      this.emitter.untab();
      this.emitter.emitLineTabbed('}');
    } else if (this.checkToken(TokenType.WHILE)) {
      this.nextToken();
      this.emitter.emitTabbed('for ');
      this.comparison();

      this.match(TokenType.REPEAT);
      this.nl();
      this.emitter.emitLine(' {');
      this.emitter.tab();

      while (!this.checkToken(TokenType.ENDWHILE)) this.statement();

      this.match(TokenType.ENDWHILE);
      this.emitter.untab();
      this.emitter.emitLineTabbed('}');
    } else if (this.checkToken(TokenType.LABEL)) {
      this.nextToken();

      if (this.labelsDeclared.has(this.curToken.value))
        this.abort(`Label ${this.curToken.value} already exists`);
      this.labelsDeclared.add(this.curToken.value);

      this.emitter.emitLineTabbed(`${this.curToken.value}:`);
      this.match(TokenType.IDENT);
    } else if (this.checkToken(TokenType.GOTO)) {
      this.nextToken();

      this.labelsGotoed.add(this.curToken.value);

      this.emitter.emitLineTabbed(`goto ${this.curToken.value}`);
      this.match(TokenType.IDENT);
    } else if (this.checkToken(TokenType.VAR)) {
      this.nextToken();

      if (!this.symbols.has(this.curToken.value)) {
        this.symbols.add(this.curToken.value);
        this.emitter.defLine(`var ${this.curToken.value} float64`);
      }

      this.emitter.emitTabbed(`${this.curToken.value} = `);
      this.match(TokenType.IDENT);
      this.match(TokenType.EQ);

      this.expr();
      this.emitter.emitLine('');
    } else if (this.checkToken(TokenType.INPUT)) {
      this.nextToken();

      if (!this.symbols.has(this.curToken.value)) {
        this.symbols.add(this.curToken.value);
        this.emitter.defLine(`var ${this.curToken.value} float64`);
      }

      this.emitter.emitLineTabbed(`fmt.Scan(&${this.curToken.value})`);
      this.match(TokenType.IDENT);
    } else {
      this.abort(`Invalid statement at ${this.curToken.value} (${TokenType[this.curToken.type]})`);
    }

    this.nl();
  }

  private comparison() {
    this.expr();

    if (this.isComparisonOperator()) {
      this.emitter.emit(` ${this.curToken.value} `);
      this.nextToken();
      this.expr();
    } else {
      this.abort(`Expected comparison operator at ${this.curToken.value}`);
    }

    while (this.isComparisonOperator()) {
      this.emitter.emit(this.curToken.value);
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
    this.term();
    while (this.checkToken(TokenType.PLUS) || this.checkToken(TokenType.MINUS)) {
      this.emitter.emit(` ${this.curToken.value} `);
      this.nextToken();
      this.term();
    }
  }

  private term() {
    this.unary();
    while (this.checkToken(TokenType.ASTERISK) || this.checkToken(TokenType.SLASH)) {
      this.emitter.emit(` ${this.curToken.value} `);
      this.nextToken();
      this.unary();
    }
  }

  private unary() {
    if (this.checkToken(TokenType.PLUS) || this.checkToken(TokenType.MINUS)) {
      this.emitter.emit(`${this.curToken.value}`);
      this.nextToken();
    }
    this.primary();
  }

  private primary() {
    if (this.checkToken(TokenType.NUMBER)) {
      this.emitter.emit(this.curToken.value);
      this.nextToken();
    } else if (this.checkToken(TokenType.IDENT)) {
      if (!this.symbols.has(this.curToken.value))
        this.abort(`Referencing variable before assignment: ${this.curToken.value}`);

      this.emitter.emit(this.curToken.value);
      this.nextToken();
    } else {
      this.abort(`Unexpected token at ${this.curToken.value}`);
    }
  }

  private nl() {
    this.match(TokenType.NEWLINE);
    while (this.checkToken(TokenType.NEWLINE)) {
      this.emitter.emitLine('');
      this.nextToken();
    }
  }
}
