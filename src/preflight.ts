import PreflightOptions from './types/preflight_options';

class Preflight {
  gitClean: boolean;

  gitInSyncWithBaseBranch: boolean;

  npmAuth: boolean;

  constructor(options: PreflightOptions = {}) {
    this.gitClean = options.gitClean ?? false;
    this.gitInSyncWithBaseBranch = options.gitInSyncWithBaseBranch ?? false;
    this.npmAuth = options.npmAuth ?? false;
  }

  hasChecks(): boolean {
    return this.gitClean || this.gitInSyncWithBaseBranch || this.npmAuth;
  }
}

export default Preflight;
