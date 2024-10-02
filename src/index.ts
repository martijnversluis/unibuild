import CLI from './cli';
import BuilderCallback from './builder_callback';
import configure from './configure';

export { default as Builder } from './builder';

export default function unibuild(callback: BuilderCallback) {
  const config = configure(callback);
  new CLI(config).run();
}
