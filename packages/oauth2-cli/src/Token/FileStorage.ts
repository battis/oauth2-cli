import { Mutex } from 'async-mutex';
import fs from 'node:fs';
import path from 'node:path';
import { Storage } from './Storage.js';

/**
 * Save a refresh token to a specific file
 *
 * Care _must_ be taken when using this persistence strategy that:
 *
 * 1. The token file is not publicly accessible
 * 2. The token file is _not_ commited to a public repository
 *
 * This strategy is appropriate only in very limited set of use cases.
 */
export class FileStorage implements Storage {
  /** Prevent multiple simultaneous, conflicting file accesses */
  private fileLock = new Mutex();
  private readonly filePath: string;

  /**
   * @param filePath The path to the token file (optionally relative to the
   *   current working directory)
   */
  public constructor(filePath: string) {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  public async load() {
    return await this.fileLock.runExclusive(
      (async () => {
        if (fs.existsSync(this.filePath)) {
          return fs.readFileSync(this.filePath).toString();
        }
        return undefined;
      }).bind(this)
    );
  }

  public async save(refresh_token: string) {
    await this.fileLock.runExclusive(
      (async () => {
        const dirPath = path.dirname(this.filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(this.filePath, refresh_token);
      }).bind(this)
    );
  }
}
