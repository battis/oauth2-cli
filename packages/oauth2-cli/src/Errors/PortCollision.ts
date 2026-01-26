export class PortCollision extends Error {
  public constructor(port: string) {
    super(
      `Cannot start authorization: another process is already running at http://localhost:${port}.`
    );
  }
}
