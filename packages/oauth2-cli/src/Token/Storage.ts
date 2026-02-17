export interface Storage {
  load(): Promise<string | undefined>;
  save(refresh_token: string): Promise<void>;
}
