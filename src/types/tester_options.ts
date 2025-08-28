import Asset from '../asset';
import Tester from '../tester';

import { CommandGenerator } from '../cmd';

interface TesterOptions {
  command: string | string[] | CommandGenerator<Tester>;
  requires: Asset | Asset[];
}

export default TesterOptions;
