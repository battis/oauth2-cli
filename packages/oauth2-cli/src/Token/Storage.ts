/** Persistent refresh token storage */
export interface Storage {
  /** Load the stored refresh token from persistent storage, if present */
  load(): Promise<string | undefined>;

  /** Save a refresh token to persistent storage */
  save(refresh_token: string): Promise<void>;
}
