export class IndeterminateConfiguration extends Error {
  public constructor() {
    super(
      'A configuration could not be determined from the provided credentials.'
    );
  }
}
