import { execSync } from 'child_process';
import Asset from './asset';

export type CommandGenerator<Type> = (input: Type) => string | string[];

export function generateCommand<Type>(command: string | string[] | CommandGenerator<Type>, input: Type): string {
  let commandArray: string[] = [];

  if (typeof command === 'string') {
    commandArray = [command];
  } else if (Array.isArray(command)) {
    commandArray = [...command];
  } else {
    commandArray = [...command(input)];
  }

  return commandArray.flat().join(' && ');
}

export default function cmd(command: string): void {
  execSync(command, { stdio: 'inherit' });
}
