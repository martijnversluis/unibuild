import { generateCommand } from '../src/cmd';

describe('generateCommand', () => {
  it('returns the command string as-is if a string is provided', () => {
    const command = 'echo "Hello, World!"';
    const result = generateCommand(command, null);
    expect(result).toBe(command);
  });

  it('joins an array of command strings with &&', () => {
    const commands = ['echo "Hello"', 'echo "World!"'];
    const result = generateCommand(commands, null);
    expect(result).toBe('echo "Hello" && echo "World!"');
  });

  it('calls the command generator function with the input and returns the resulting command string', () => {
    const commandGenerator = (input: { name: string }) => `echo "Hello, ${input.name}!"`;
    const input = { name: 'Alice' };
    const result = generateCommand(commandGenerator, input);
    expect(result).toBe('echo "Hello, Alice!"');
  });

  it('calls the command generator function that returns an array and joins the result with &&', () => {
    const commandGenerator = (input: { name: string }) => [
      `echo "Hello, ${input.name}"`,
      'echo "Welcome!"',
    ];
    const input = { name: 'Bob' };
    const result = generateCommand(commandGenerator, input);
    expect(result).toBe('echo "Hello, Bob" && echo "Welcome!"');
  });
});
