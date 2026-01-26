import { Response } from './Response.js';

export interface TokenStorage {
  load(): Promise<Response | undefined>;
  save(tokens: Response): Promise<void>;
}
