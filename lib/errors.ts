export class ESError extends Error {
  code: string;
  statusCode: number;
  constructor(code: string, statusCode: number, message: string) {
    super(message);
    this.name = code;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function createError(
  code: string,
  statusCode: number,
  message: string,
  Base = ESError,
) {
  return class extends Base {
    constructor() {
      super(code, statusCode, message);
    }
  };
}
