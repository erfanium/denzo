import { ESError } from "./errors.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export function defaultErrorHandler(
  error: unknown,
  _request: ESRequest,
  reply: ESReply,
) {
  if (error instanceof ESError) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
    });
  }

  return Promise.resolve(error);
}
