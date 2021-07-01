export interface Inject {
  (
    input: Request | URL | string,
    init?: RequestInit,
  ): Promise<Response>;
}

export type MockedRespondWith = [
  (r: Response | Promise<Response>) => Promise<void>,
  () => Response | Promise<Response> | undefined,
];

export interface InjectHandler {
  handle(re: Deno.RequestEvent): Promise<void>;
}

function mockRespondWith(): MockedRespondWith {
  let response: Response | Promise<Response> | undefined;
  const fn: Deno.RequestEvent["respondWith"] = (r) => {
    response = r;
    return Promise.resolve();
  };

  return [fn, () => response];
}

export function createInject(app: InjectHandler): Inject {
  return async (input, init?): Promise<Response> => {
    if (typeof input === "string" && input.startsWith("/")) {
      input = "http://0.0.0.0:0" + input;
    }

    const request = new Request(
      input instanceof URL ? input.toString() : input,
      init,
    );

    const [respondWith, getResponse] = mockRespondWith();

    await app.handle({ request, respondWith });
    const response = await getResponse();
    if (!response) {
      throw new Error(
        "server did not respond to the requestEvent. most likely a bug in Denzo",
      );
    }
    return response;
  };
}
