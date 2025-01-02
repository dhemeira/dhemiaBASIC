import { TokenType } from './tokenType';

export class Token {
  type: TokenType;
  value: string;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

  public static checkIfKeyword(token: string) {
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
