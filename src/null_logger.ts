import Logger from './logger';

class NullLogger extends Logger {
  log(_string: string, _styles: string[] = []) {
    // Do nothing
  }
}

export default NullLogger;
