import { DenzoError } from "./errors.ts";
import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";

export interface ErrorHandler {
  (error: Error, request: DenzoRequest, reply: DenzoReply): Promise<void>;
}

export const defaultErrorHandler: ErrorHandler = (error, _, reply) => {
  console.error(error);
  if (error instanceof DenzoError) {
    reply.status(error.statusCode).send({
      errorCode: error.errorCode,
      message: error.message,
    });
    return Promise.resolve();
  }

  reply.status(500).send({
    errorCode: "INTERNAL_SERVER_ERROR",
    message: error?.message,
  });
  return Promise.resolve();
};
