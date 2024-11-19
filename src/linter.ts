import LinterOptions from './linter_options';
import { generateCommand } from './cmd';
import Asset from './asset';

class Linter {
  name: string;

  command: string;

  autofixCommand?: string;

  requires: Asset[];

  constructor(name: string, options: LinterOptions) {
    this.name = name;
    this.requires = [options.requires].flat();
    this.command = generateCommand<Linter>(options.command, this);

    if (options.autofixCommand) {
      this.autofixCommand = generateCommand<Linter>(options.autofixCommand, this);
    }
  }
}

export default Linter;
