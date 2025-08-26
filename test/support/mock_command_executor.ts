class MockCommandExecutor {
  executedCommands: string[] = [];

  execute(command: string) {
    this.executedCommands.push(command);
  }
}

export default MockCommandExecutor;
