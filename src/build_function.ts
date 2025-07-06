import BuildOptions from './build_options';

type BuildFunction = (options: Partial<BuildOptions>, ...args: string[]) => string;

export default BuildFunction;
