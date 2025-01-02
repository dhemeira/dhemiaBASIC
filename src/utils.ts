export function print(message: string) {
  const output = document.getElementById('output');

  if (output) output.innerHTML += '<li>' + message + '</li>';
  else console.log(message);
}

export function clearOutput() {
  const output = document.getElementById('output');

  if (output) output.innerHTML = '';
}

export function isDigit(c: string) {
  return /[0-9]/.test(c);
}

export function isAlpha(c: string) {
  return /[a-zA-Z_]/.test(c);
}

export function isAlphanumeric(c: string) {
  return isAlpha(c) || isDigit(c);
}

export function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
