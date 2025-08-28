import chalk, { Chalk } from 'chalk';

class Logger {
  level = 0;

  indent(callback: () => any) {
    this.level += 1;
    const returnValue: any = callback();
    this.level -= 1;
    return returnValue;
  }

  section(string: string, callback: () => any) {
    this.log(string);
    return this.indent(callback);
  }

  log(string: string, styles: string[] = []) {
    const indented = this.indentString(string, this.level);
    const styled = this.styledLogger(styles)(indented);
    console.log(styled);
  }

  styledLogger(styles: string[]): Chalk {
    let writer = chalk.reset;

    styles.forEach((style) => {
      if (writer[style] === undefined) {
        throw new Error(`No such style: ${style}`);
      }

      writer = writer[style];
    });

    return writer;
  }

  indentString(string: string, level = 0, indentString = '  ') {
    let indentation = '';

    for (let i = 0; i < level; i += 1) {
      indentation += indentString;
    }

    return indentation + string;
  }
}

export default Logger;
