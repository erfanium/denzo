import { ESError } from "./errors.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export interface ErrorHandler {
  (error: Error, request: ESRequest, reply: ESReply): Promise<void>;
}

export const defaultErrorHandler: ErrorHandler = (error, _, reply) => {
  if (error instanceof ESError) {
    reply.code(error.statusCode).send({
      errorCode: error.errorCode,
      message: error.message,
    });
    return Promise.resolve();
  }

  reply.code(500).send({
    errorCode: "INTERNAL_SERVER_ERROR",
    message: error?.message,
  });
  return Promise.resolve();
};
