import Config from './config';

export default function configure(callback: (config: Config) => void) {
  return new Config(callback);
}
