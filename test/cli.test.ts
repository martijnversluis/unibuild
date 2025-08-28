import CLI from '../src/cli';
import Config from '../src/config';

function buildMockBuilder() {
  return {
    build: jest.fn(),
    clean: jest.fn(),
    lint: jest.fn(),
    test: jest.fn(),
    bump: jest.fn(),
    publish: jest.fn(),
    gitPush: jest.fn(),
    release: jest.fn(),
  };
}

describe('CLI', () => {
  describe('<without arguments>', () => {
    it('calls builder.build with default parameters', () => {
      const config = new Config();
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild']);

      expect(mockBuilder.build).toHaveBeenCalledWith([], { force: false, release: false });
    });
  });

  describe('build', () => {
    describe('<without arguments>', () => {
      it('calls builder.build with correct parameters', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build']);

        expect(mockBuilder.build).toHaveBeenCalledWith([], { force: false, release: false });
      });
    });

    describe('asset1 asset2', () => {
      it('calls builder.build with correct asset names', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build', 'asset1', 'asset2']);

        expect(mockBuilder.build).toHaveBeenCalledWith(['asset1', 'asset2'], { force: false, release: false });
      });
    });

    describe('build -f', () => {
      it('calls builder.build with force true', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build', '-f']);

        expect(mockBuilder.build).toHaveBeenCalledWith([], { force: true, release: false });
      });
    });

    describe('build --force', () => {
      it('calls builder.build with force true', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build', '--force']);

        expect(mockBuilder.build).toHaveBeenCalledWith([], { force: true, release: false });
      });
    });

    describe('build -r', () => {
      it('calls builder.build with release true', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build', '-r']);

        expect(mockBuilder.build).toHaveBeenCalledWith([], { force: false, release: true });
      });
    });

    describe('build --release', () => {
      it('calls builder.build with release true', () => {
        const config = new Config(() => {
        });
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'build', '--release']);

        expect(mockBuilder.build).toHaveBeenCalledWith([], { force: false, release: true });
      });
    });
  });

  describe('lint', () => {
    describe('<without arguments>', () => {
      it('calls builder.lint with default parameters', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'lint']);

        expect(mockBuilder.lint).toHaveBeenCalledWith({ fix: false });
      });
    });

    describe('lint --fix', () => {
      it('calls builder.lint with fix true', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'lint', '--fix']);

        expect(mockBuilder.lint).toHaveBeenCalledWith({ fix: true });
      });
    });

    describe('lint -f', () => {
      it('calls builder.lint with fix true', () => {
        const config = new Config();
        const mockBuilder = buildMockBuilder();
        const cli = new CLI(config, mockBuilder as any);

        cli.run(['', 'unibuild', 'lint', '-f']);

        expect(mockBuilder.lint).toHaveBeenCalledWith({ fix: true });
      });
    });
  });

  describe('test', () => {
    it('calls builder.test', () => {
      const config = new Config();
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'test']);

      expect(mockBuilder.test).toHaveBeenCalled();
    });
  });

  describe('clean', () => {
    it('calls builder.clean', () => {
      const config = new Config();
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'clean']);

      expect(mockBuilder.clean).toHaveBeenCalledWith([]);
    });

    it('calls builder.clean with asset names', () => {
      const config = new Config();
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'clean', 'asset1', 'asset2']);

      expect(mockBuilder.clean).toHaveBeenCalledWith(['asset1', 'asset2']);
    });
  });

  describe('ci', () => {
    it('calls builder.ci', () => {
      const config = new Config();
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'ci']);

      expect(mockBuilder.build).toHaveBeenNthCalledWith(1, [], { force: false, release: false });
      expect(mockBuilder.lint).toHaveBeenCalledWith({ fix: false });
      expect(mockBuilder.test).toHaveBeenCalled();
      expect(mockBuilder.build).toHaveBeenNthCalledWith(2, [], { force: false, release: true });
    });
  });

  describe('bump <version>', () => {
    it('calls builder.bump with the version', () => {
      const config = new Config(() => {
      });
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'bump', '1.2.3']);

      expect(mockBuilder.bump).toHaveBeenCalledWith('1.2.3');
    });
  });

  describe('publish', () => {
    it('calls builder.publish', () => {
      const config = new Config(() => {
      });
      const mockBuilder = buildMockBuilder();
      const cli = new CLI(config, mockBuilder as any);

      cli.run(['', 'unibuild', 'publish']);

      expect(mockBuilder.publish).toHaveBeenCalled();
    });
  });
});
