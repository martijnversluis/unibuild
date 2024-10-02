import Config from './config';
import BuilderCallback from "./builder_callback";

export default function configure(callback: BuilderCallback) {
  return new Config(callback);
}
