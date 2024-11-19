import { CommandGenerator } from './cmd';
import Asset from './asset';
import Linter from './linter';

interface LinterOptions {
  command: string | CommandGenerator<Linter>;
  autofixCommand?: string | CommandGenerator<Linter>;
  requires: Asset | Asset[];
}

export default LinterOptions;
