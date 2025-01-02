export function print(message: string) {
  const output = document.getElementById('output');

  if (output) output.innerHTML += '<li>' + message + '</li>';
  else console.log(message);
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
