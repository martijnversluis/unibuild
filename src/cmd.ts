import { execSync } from 'child_process';
import Asset from './asset';

export type CommandGenerator<Type> = (input: Type) => string;

export function generateCommand<Type>(command: string | CommandGenerator<Type>, input: Type): string {
  if (typeof command === 'string') {
    return command;
  }

  return command(input);
}

export default function cmd(command: string): void {
  execSync(command, { stdio: 'inherit' });
}
