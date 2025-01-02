import './styles/style.css';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { clearOutput, print } from './utils';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dhemiaBASIC</h1>
    <input id="source-file" type="file" accept=".dhba" />
    <button id="run">Run</button>
    <div id="output-wrapper">
      <ol id="output"></ol>
    </div>
    <p>Based on <a href="https://austinhenley.com/blog/teenytinycompiler1.html">this tutorial</a></p>
  </div>
`;

document.querySelector<HTMLButtonElement>('#run')!.addEventListener('click', () => {
  clearOutput();
  const sourceFileInput = document.getElementById('source-file') as HTMLInputElement;

  if (sourceFileInput && sourceFileInput.files && sourceFileInput.files.length > 0) {
    const file = sourceFileInput.files[0];

    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (evt) {
      const source = evt?.target?.result;
      try {
        run(source as string);
      } catch (e) {
        print((<Error>e).message);
      }
    };
  } else {
    print('ERROR: No file selected.');
  }
});

function run(source: string) {
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);

  parser.program();
  print('Parsed successfully');
}

