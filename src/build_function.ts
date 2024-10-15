import BuildOptions from "./build_options";

type BuildFunction = (options: BuildOptions, ...args: string[]) => string;

export default BuildFunction;
