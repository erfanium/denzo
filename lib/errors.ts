export class DenzoError extends Error {
  errorCode: string;
  statusCode: number;
  constructor(errorCode: string, statusCode: number, message: string) {
    super(message);
    this.name = errorCode;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}

export function createError(
  code: string,
  statusCode: number,
  message: string,
  Base = DenzoError,
) {
  return class extends Base {
    constructor() {
      super(code, statusCode, message);
    }
  };
}
