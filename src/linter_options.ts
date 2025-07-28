import Asset from './asset';
import Linter from './linter';

import { CommandGenerator } from './cmd';

interface LinterOptions {
  command: string | string[] | CommandGenerator<Linter>;
  autofixCommand?: string | string[] | CommandGenerator<Linter>;
  requires: Asset | Asset[];
}

export default LinterOptions;
