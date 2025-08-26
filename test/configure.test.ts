import Config from '../src/config';
import configure from '../src/configure';

describe('configure', () => {
  it('calls the callback with a config object', () => {
    const callback = jest.fn();
    configure(callback);

    expect(callback).toHaveBeenCalled();
    const configArg = callback.mock.calls[0][0];
    expect(configArg instanceof Config).toBe(true);
  });
});
