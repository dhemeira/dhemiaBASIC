import './styles/style.css';
import { Lexer, TokenType } from './lexer';
import { print } from './utils';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dhemia</h1>
    <div id="output-wrapper">
      <ol id="output"></ol>
    </div>
    <p>Based on <a href="https://austinhenley.com/blog/teenytinycompiler1.html">this tutorial</a></p>
  </div>
`;
try {
  main();
} catch (e) {
  print((<Error>e).message);
}

function main() {
  const source = 'if+-123 foo*then/';

  const lexer = new Lexer(source);

  let token = lexer.getToken();
  while (token?.type !== TokenType.EOF) {
    if (token?.type === TokenType.STRING) print(`${TokenType[token!.type]}: ${token.value}`);
    else if (token?.type === TokenType.NUMBER) print(`${TokenType[token!.type]}: ${token.value}`);
    else print(TokenType[token!.type]);

    token = lexer.getToken();
  }
}

