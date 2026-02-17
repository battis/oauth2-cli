import { Mutex } from 'async-mutex';
import fs from 'node:fs';
import path from 'node:path';
import { Storage } from './Storage.js';

export class FileStorage implements Storage {
  private fileLock = new Mutex();
  private readonly filePath: string;

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
