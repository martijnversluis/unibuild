import { execSync } from 'child_process';
import Asset from './asset';

export type CommandGenerator<Type> = (input: Type) => string | string[];

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

export default function cmd(command: string): void {
  execSync(command, { stdio: 'inherit' });
}
