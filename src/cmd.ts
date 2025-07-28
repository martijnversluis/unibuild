import { exec } from 'child_process';
import { promisify } from 'node:util';

export type CommandGenerator<Type> = (input: Type) => string | string[];

const execAsync = promisify(exec);

function stringifyCommand(command: string | string[]): string {
  if (typeof command === 'string') {
    return command;
  }

  return command.join(' && ');
}

export function generateCommand<Type>(command: string | string[] | CommandGenerator<Type>, input: Type): string {
  if (typeof command === 'function') {
    return stringifyCommand(command(input));
  }

  return stringifyCommand(command);
}

export default async function cmd(command: string): Promise<string> {
  const { stdout, stderr } = await execAsync(command);

  if (stderr) {
    throw new Error(`Command "${command}" failed with error: ${stderr}`);
  }

  return stdout;
}
