import { ESError } from "./errors.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export interface ErrorHandler {
  (error: unknown, request: ESRequest, reply: ESReply): Promise<void>;
}

export const defaultErrorHandler: ErrorHandler = (error, _, reply) => {
  if (error instanceof ESError) {
    reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
    });
    return Promise.resolve();
  }

  return Promise.reject(error);
};
