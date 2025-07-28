import BuilderCallback from './builder_callback';
import Config from './config';

export default function configure(callback: BuilderCallback) {
  return new Config(callback);
}
