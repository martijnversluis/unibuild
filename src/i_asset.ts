interface IAsset {
  path: string;
  modifiedTime(): Promise<number>;
  newerThan(other: IAsset): Promise<boolean>;
  exists(): Promise<boolean>;
  canBeBuilt(): Promise<boolean>;
  needsBuilding(options: Partial<{ force: boolean,  release: boolean }>): Promise<boolean>;
  needsRebuild(): Promise<boolean>;
  isFile(): Promise<boolean>;
  read(): Promise<string>;
  toString(): string;
}

export default IAsset;
