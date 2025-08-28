import * as crypto from 'node:crypto';
import * as fs from 'fs';
import { devNull } from 'os';
import { resolve } from 'node:path';

import Asset from '../../src/asset';
import AssetOptions from '../../src/types/asset_options';

export function buildAsset(options: Partial<AssetOptions> & { name?: string } = {}) {
  const name = options.name || 'testAsset';
  const optionsWithoutName = { ...options };
  delete optionsWithoutName.name;

  return new Asset(name, {
    input: 'path/to/inputFile.js',
    outfile: 'path/to/outputFile.js',
    build: (_opts) => 'output',
    command: `echo "Building asset" > ${devNull}`,
    ...options,
  });
}

export function tempFilePath(filename: string) {
  // eslint-disable-next-line no-undef
  const { currentTestName } = expect.getState();
  const hash = crypto.createHash('md5').update(currentTestName || '').digest('hex');
  return `tmp/${filename}${hash}`;
}

export function removeTempFile(filePath: string) {
  const fullPath = resolve(__dirname, '../../', filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export function withTempFiles(files: Record<string, Date>, callback: (_paths: string[]) => void) {
  const tempDir = resolve(__dirname, '../../tmp');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePaths = Object.entries(files).map(([filename, modifiedTime]) => {
    const relativePath = tempFilePath(filename);
    const filePath = resolve(__dirname, '../../', relativePath);
    fs.writeFileSync(filePath, '');
    fs.utimesSync(filePath, new Date(), modifiedTime);
    return relativePath;
  });

  try {
    callback(filePaths);
  } finally {
    filePaths.forEach((filePath) => {
      removeTempFile(filePath);
    });
  }
}

export function withTempFile(filename: string, modifiedTime: Date, callback: (_path: string) => void) {
  withTempFiles({ [filename]: modifiedTime }, ([path]) => callback(path));
}
