import TesterOptions from './tester_options';
import Asset from './asset';
import { generateCommand } from './cmd';

class Tester {
  name: string;

  command: string;

  requires: Asset[];

  constructor(name: string, options: TesterOptions) {
    this.name = name;
    this.command = generateCommand<Tester>(options.command, this);
    this.requires = [options.requires].flat();
  }
}

export default Tester;
