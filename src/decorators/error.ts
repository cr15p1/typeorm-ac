export class MiddlewareNotProvided extends Error {
  constructor() {
    super('middleware is not provided, please add it to your serve');
  }
}
