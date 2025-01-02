import { download } from './utils';

export class Emitter {
  fullPath: string;
  header: string;
  defs: string;
  code: string;
  tabs: number;

  constructor(fullPath: string) {
    this.fullPath = fullPath;
    this.header = '';
    this.defs = '';
    this.code = '';
    this.tabs = 0;
  }

  public emitTabbed(code: string) {
    this.code += '\t'.repeat(this.tabs) + code;
  }

  public emit(code: string) {
    this.code += code;
  }

  public tab() {
    this.tabs++;
  }

  public untab() {
    if (this.tabs > 0) {
      this.tabs--;
    }
  }

  public emitLine(code: string) {
    this.emit(code + '\n');
  }

  public emitLineTabbed(code: string) {
    this.emitTabbed(code + '\n');
  }

  public headerLine(code: string) {
    this.header += '\t'.repeat(this.tabs) + code + '\n';
  }

  public defLine(code: string) {
    this.defs += '\t'.repeat(this.tabs > 0 ? 1 : 0) + code + '\n';
  }

  public writeFile() {
    if (this.defs != '') this.defs += '\n';
    download(this.fullPath, this.header + this.defs + this.code);
  }
}
