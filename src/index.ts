import BuilderCallback from './builder_callback';
import configure from './configure';
export { default as Asset } from './asset';

export default function unibuild(callback: BuilderCallback) {
  return configure(callback);
}
