import Asset from './asset';
import LinterOptions from './types/linter_options';

import { generateCommand } from './cmd';

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
