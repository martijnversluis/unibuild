import { CommandGenerator } from './cmd';
import Asset from './asset';
import Tester from './tester';

interface TesterOptions {
  command: string | string[] | CommandGenerator<Tester>;
  requires: Asset | Asset[];
}

export default TesterOptions;
