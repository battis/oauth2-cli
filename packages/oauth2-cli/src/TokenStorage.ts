import { Token } from './Token.js';

export interface TokenStorage {
  load(): Promise<Token | undefined>;
  save(tokens: Token): Promise<void>;
}
